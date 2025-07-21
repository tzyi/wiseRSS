import feedparser
import requests
from datetime import datetime
from urllib.parse import urljoin, urlparse
import hashlib
from bs4 import BeautifulSoup
from app import db
from app.models.feed import Feed
from app.models.article import Article

class FeedService:
    @staticmethod
    def validate_rss_url(url):
        """Validate RSS URL and return feed information"""
        try:
            # Add http:// if no protocol specified
            if not url.startswith(('http://', 'https://')):
                url = 'http://' + url
            
            # Parse the feed
            response = requests.get(url, timeout=10, headers={
                'User-Agent': 'WiseRSS/1.0 (RSS Reader)'
            })
            response.raise_for_status()
            
            feed = feedparser.parse(response.content)
            
            if feed.bozo and not feed.entries:
                return {
                    'isValid': False,
                    'error': 'Invalid RSS feed format'
                }
            
            # Extract feed information
            feed_info = {
                'isValid': True,
                'title': feed.feed.get('title', ''),
                'description': feed.feed.get('description', ''),
                'website_url': feed.feed.get('link', ''),
                'language': feed.feed.get('language', ''),
                'image_url': None,
                'article_count': len(feed.entries)
            }
            
            # Get feed image
            if hasattr(feed.feed, 'image') and feed.feed.image:
                feed_info['image_url'] = feed.feed.image.get('href')
            elif hasattr(feed.feed, 'logo'):
                feed_info['image_url'] = feed.feed.logo
            
            return feed_info
            
        except requests.RequestException as e:
            return {
                'isValid': False,
                'error': f'Network error: {str(e)}'
            }
        except Exception as e:
            return {
                'isValid': False,
                'error': f'Parsing error: {str(e)}'
            }
    
    @staticmethod
    def update_feed(feed_id):
        """Update a single feed with new articles"""
        try:
            feed = Feed.query.get(feed_id)
            if not feed:
                return {'success': False, 'error': 'Feed not found'}
            
            # Prepare request headers for conditional requests
            headers = {
                'User-Agent': 'WiseRSS/1.0 (RSS Reader)',
                'Accept': 'application/rss+xml, application/xml, text/xml'
            }
            
            if feed.etag:
                headers['If-None-Match'] = feed.etag
            if feed.last_modified:
                headers['If-Modified-Since'] = feed.last_modified
            
            # Fetch the feed
            response = requests.get(feed.url, headers=headers, timeout=15)
            
            # Handle 304 Not Modified
            if response.status_code == 304:
                feed.last_checked = datetime.utcnow()
                db.session.commit()
                return {'success': True, 'articles_added': 0, 'message': 'Feed not modified'}
            
            response.raise_for_status()
            
            # Parse the feed
            parsed_feed = feedparser.parse(response.content)
            
            if parsed_feed.bozo and not parsed_feed.entries:
                error_msg = f"Feed parsing error: {parsed_feed.bozo_exception}"
                feed.mark_error(error_msg)
                return {'success': False, 'error': error_msg}
            
            # Update feed metadata
            if hasattr(parsed_feed.feed, 'title'):
                feed.title = parsed_feed.feed.title
            if hasattr(parsed_feed.feed, 'description'):
                feed.description = parsed_feed.feed.description
            
            # Store ETag and Last-Modified for future requests
            if 'etag' in response.headers:
                feed.etag = response.headers['etag']
            if 'last-modified' in response.headers:
                feed.last_modified = response.headers['last-modified']
            
            # Process articles
            articles_added = 0
            for entry in parsed_feed.entries:
                if FeedService._create_article_from_entry(feed, entry):
                    articles_added += 1
            
            # Update feed status
            feed.mark_success()
            feed.update_stats()
            
            return {
                'success': True,
                'articles_added': articles_added,
                'total_entries': len(parsed_feed.entries)
            }
            
        except requests.RequestException as e:
            error_msg = f"Network error: {str(e)}"
            feed.mark_error(error_msg)
            return {'success': False, 'error': error_msg}
        except Exception as e:
            error_msg = f"Update error: {str(e)}"
            feed.mark_error(error_msg)
            return {'success': False, 'error': error_msg}
    
    @staticmethod
    def _create_article_from_entry(feed, entry):
        """Create article from feed entry"""
        try:
            # Get article URL
            article_url = entry.get('link', '')
            if not article_url:
                return False
            
            # Check if article already exists
            existing_article = Article.query.filter_by(url=article_url).first()
            if existing_article:
                return False
            
            # Parse published date
            published_at = None
            if hasattr(entry, 'published_parsed') and entry.published_parsed:
                try:
                    published_at = datetime(*entry.published_parsed[:6])
                except (TypeError, ValueError):
                    pass
            
            # Get content
            content = ''
            description = ''
            
            if hasattr(entry, 'content') and entry.content:
                content = entry.content[0].value
            elif hasattr(entry, 'summary'):
                content = entry.summary
            
            if hasattr(entry, 'summary'):
                description = entry.summary
            
            # Clean HTML content
            if content:
                soup = BeautifulSoup(content, 'html.parser')
                content = soup.get_text()
            
            if description:
                soup = BeautifulSoup(description, 'html.parser')
                description = soup.get_text()
            
            # Generate content hash for deduplication
            content_hash = hashlib.sha256(
                (entry.get('title', '') + content).encode('utf-8')
            ).hexdigest()
            
            # Check for duplicate content
            if Article.query.filter_by(content_hash=content_hash).first():
                return False
            
            # Get image URL
            image_url = None
            if hasattr(entry, 'media_content') and entry.media_content:
                image_url = entry.media_content[0].get('url')
            elif hasattr(entry, 'enclosures') and entry.enclosures:
                for enclosure in entry.enclosures:
                    if enclosure.type.startswith('image/'):
                        image_url = enclosure.href
                        break
            
            # Extract categories/tags
            categories = []
            if hasattr(entry, 'tags'):
                categories = [tag.term for tag in entry.tags]
            
            # Create article
            article = Article(
                feed_id=feed.id,
                title=entry.get('title', 'Untitled'),
                url=article_url,
                description=description[:1000] if description else None,  # Limit description length
                content=content,
                author=entry.get('author'),
                published_at=published_at or datetime.utcnow(),
                guid=entry.get('id'),
                content_hash=content_hash,
                image_url=image_url,
                categories=categories,
                language=feed.language
            )
            
            # Calculate reading time
            article.calculate_reading_time()
            
            db.session.add(article)
            db.session.commit()
            
            return True
            
        except Exception as e:
            print(f"Error creating article from entry: {e}")
            return False
    
    @staticmethod
    def update_all_feeds():
        """Update all active feeds"""
        active_feeds = Feed.get_active_feeds()
        results = []
        
        for feed in active_feeds:
            result = FeedService.update_feed(feed.id)
            results.append({
                'feed_id': feed.id,
                'feed_title': feed.title,
                'result': result
            })
        
        return results
    
    @staticmethod
    def discover_feeds(url):
        """Discover RSS feeds from a website URL"""
        try:
            response = requests.get(url, timeout=10, headers={
                'User-Agent': 'WiseRSS/1.0 (RSS Reader)'
            })
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            feeds = []
            
            # Look for RSS/Atom feed links
            for link in soup.find_all('link', type=['application/rss+xml', 'application/atom+xml']):
                feed_url = urljoin(url, link.get('href', ''))
                feed_title = link.get('title', 'RSS Feed')
                feeds.append({
                    'url': feed_url,
                    'title': feed_title,
                    'type': link.get('type')
                })
            
            # Common RSS paths to check
            common_paths = ['/rss', '/feed', '/feeds', '/rss.xml', '/feed.xml', '/atom.xml']
            base_url = f"{urlparse(url).scheme}://{urlparse(url).netloc}"
            
            for path in common_paths:
                feed_url = base_url + path
                try:
                    feed_response = requests.head(feed_url, timeout=5)
                    if feed_response.status_code == 200:
                        feeds.append({
                            'url': feed_url,
                            'title': f'RSS Feed ({path})',
                            'type': 'application/rss+xml'
                        })
                except:
                    continue
            
            return {'success': True, 'feeds': feeds}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}