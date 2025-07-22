from datetime import datetime
from app import db
import hashlib

class Article(db.Model):
    __tablename__ = 'articles'
    
    id = db.Column(db.Integer, primary_key=True)
    feed_id = db.Column(db.Integer, db.ForeignKey('feeds.id'), nullable=False)
    
    # Article content
    title = db.Column(db.String(500), nullable=False)
    summary = db.Column(db.Text)
    content = db.Column(db.Text)
    url = db.Column(db.String(1000), nullable=False)
    
    # Article metadata
    author = db.Column(db.String(200))
    published_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Article identifiers
    guid = db.Column(db.String(500), index=True)  # RSS guid
    content_hash = db.Column(db.String(64), index=True)  # Hash of content for deduplication
    
    # Article media
    image_url = db.Column(db.String(1000))
    media_urls = db.Column(db.Text)  # JSON string of media URLs
    
    # Article categorization
    category = db.Column(db.String(100))
    tags = db.Column(db.Text)  # JSON string of tags
    
    # Article metrics
    word_count = db.Column(db.Integer)
    read_time = db.Column(db.Integer)  # Estimated reading time in minutes
    
    # Relationships
    user_articles = db.relationship('UserArticle', backref='article', lazy='dynamic', cascade='all, delete-orphan')
    
    def __init__(self, feed_id, title, url, **kwargs):
        self.feed_id = feed_id
        self.title = title
        self.url = url
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
        
        # Generate content hash for deduplication
        self.generate_content_hash()
    
    def generate_content_hash(self):
        """Generate hash of article content for deduplication"""
        content_for_hash = f"{self.title}|{self.url}|{self.summary or ''}"
        self.content_hash = hashlib.sha256(content_for_hash.encode('utf-8')).hexdigest()
    
    def get_tags(self):
        """Get tags as a list"""
        if self.tags:
            import json
            try:
                return json.loads(self.tags)
            except:
                return []
        return []
    
    def set_tags(self, tags_list):
        """Set tags from a list"""
        import json
        if isinstance(tags_list, list):
            self.tags = json.dumps(tags_list)
        else:
            self.tags = None
    
    def get_media_urls(self):
        """Get media URLs as a list"""
        if self.media_urls:
            import json
            try:
                return json.loads(self.media_urls)
            except:
                return []
        return []
    
    def set_media_urls(self, media_list):
        """Set media URLs from a list"""
        import json
        if isinstance(media_list, list):
            self.media_urls = json.dumps(media_list)
        else:
            self.media_urls = None
    
    def calculate_read_time(self):
        """Calculate estimated reading time"""
        if self.content:
            # Average reading speed: 200 words per minute
            words = len(self.content.split())
            self.word_count = words
            self.read_time = max(1, words // 200)
        elif self.summary:
            words = len(self.summary.split())
            self.word_count = words
            self.read_time = max(1, words // 200)
        else:
            self.word_count = 0
            self.read_time = 1
    
    def get_user_article(self, user_id):
        """Get UserArticle for specific user"""
        return self.user_articles.filter_by(user_id=user_id).first()
    
    def to_dict(self, user_id=None):
        """Convert article to dictionary"""
        result = {
            'id': self.id,
            'feed_id': self.feed_id,
            'feed_name': self.feed.title if self.feed else None,
            'title': self.title,
            'summary': self.summary,
            'content': self.content,
            'url': self.url,
            'author': self.author,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'image_url': self.image_url,
            'media_urls': self.get_media_urls(),
            'category': self.category,
            'tags': self.get_tags(),
            'word_count': self.word_count,
            'read_time': self.read_time
        }
        
        # Include user-specific data if user_id provided
        if user_id:
            user_article = self.get_user_article(user_id)
            if user_article:
                result.update({
                    'is_read': user_article.is_read,
                    'is_bookmarked': user_article.is_bookmarked,
                    'reading_status': user_article.reading_status,
                    'user_rating': user_article.rating,
                    'has_notes': bool(user_article.notes),
                    'read_at': user_article.read_at.isoformat() if user_article.read_at else None
                })
            else:
                result.update({
                    'is_read': False,
                    'is_bookmarked': False,
                    'reading_status': 'unread',
                    'user_rating': None,
                    'has_notes': False,
                    'read_at': None
                })
        
        return result
    
    @classmethod
    def find_by_hash(cls, content_hash):
        """Find article by content hash"""
        return cls.query.filter_by(content_hash=content_hash).first()
    
    @classmethod
    def find_by_guid(cls, feed_id, guid):
        """Find article by feed and guid"""
        return cls.query.filter_by(feed_id=feed_id, guid=guid).first()
    
    def __repr__(self):
        return f'<Article {self.title[:50]}...>'