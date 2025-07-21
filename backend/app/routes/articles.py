from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.article import Article
from app.models.user_article import UserArticle
from app.models.feed import Feed

articles_bp = Blueprint('articles', __name__)

@articles_bp.route('', methods=['GET'])
@jwt_required()
def get_articles():
    """Get articles for current user"""
    try:
        current_user_id = get_jwt_identity()
        
        # Get query parameters
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 25))
        feed_id = request.args.get('feed_id')
        filter_type = request.args.get('filter', 'all')  # all, unread, read, favorite
        category = request.args.get('category')
        
        # Calculate offset
        offset = (page - 1) * per_page
        
        # Build filters
        filters = {}
        if feed_id:
            filters['feed_id'] = int(feed_id)
        if filter_type == 'unread':
            filters['is_read'] = False
        elif filter_type == 'read':
            filters['is_read'] = True
        elif filter_type == 'favorite':
            filters['is_favorite'] = True
        if category:
            filters['category'] = category
        
        # Get articles
        articles = Article.get_recent(
            user_id=current_user_id,
            limit=per_page,
            offset=offset,
            filters=filters
        )
        
        # Convert to dict with user-specific data
        articles_data = [article.to_dict(user_id=current_user_id) for article in articles]
        
        return jsonify({
            'articles': articles_data,
            'page': page,
            'per_page': per_page,
            'total': len(articles_data)
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get articles', 'error': str(e)}), 500

@articles_bp.route('/<int:article_id>', methods=['GET'])
@jwt_required()
def get_article(article_id):
    """Get single article by ID"""
    try:
        current_user_id = get_jwt_identity()
        
        # Check if user has access to this article (through their feeds)
        article = db.session.query(Article).join(Feed).filter(
            Article.id == article_id,
            Feed.user_id == current_user_id
        ).first()
        
        if not article:
            return jsonify({'message': 'Article not found'}), 404
        
        return jsonify({
            'article': article.to_dict(user_id=current_user_id)
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get article', 'error': str(e)}), 500

@articles_bp.route('/<int:article_id>/read', methods=['PUT'])
@jwt_required()
def mark_as_read(article_id):
    """Mark article as read"""
    try:
        current_user_id = get_jwt_identity()
        
        # Check if user has access to this article
        article = db.session.query(Article).join(Feed).filter(
            Article.id == article_id,
            Feed.user_id == current_user_id
        ).first()
        
        if not article:
            return jsonify({'message': 'Article not found'}), 404
        
        user_article = article.mark_as_read(current_user_id)
        
        return jsonify({
            'message': 'Article marked as read',
            'user_article': user_article.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to mark as read', 'error': str(e)}), 500

@articles_bp.route('/<int:article_id>/unread', methods=['PUT'])
@jwt_required()
def mark_as_unread(article_id):
    """Mark article as unread"""
    try:
        current_user_id = get_jwt_identity()
        
        # Check if user has access to this article
        article = db.session.query(Article).join(Feed).filter(
            Article.id == article_id,
            Feed.user_id == current_user_id
        ).first()
        
        if not article:
            return jsonify({'message': 'Article not found'}), 404
        
        user_article = article.mark_as_unread(current_user_id)
        
        return jsonify({
            'message': 'Article marked as unread',
            'user_article': user_article.to_dict() if user_article else None
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to mark as unread', 'error': str(e)}), 500

@articles_bp.route('/<int:article_id>/favorite', methods=['POST'])
@jwt_required()
def add_to_favorites(article_id):
    """Add article to favorites"""
    try:
        current_user_id = get_jwt_identity()
        
        # Check if user has access to this article
        article = db.session.query(Article).join(Feed).filter(
            Article.id == article_id,
            Feed.user_id == current_user_id
        ).first()
        
        if not article:
            return jsonify({'message': 'Article not found'}), 404
        
        user_article = article.toggle_favorite(current_user_id)
        
        return jsonify({
            'message': 'Article added to favorites' if user_article.is_favorite else 'Article removed from favorites',
            'user_article': user_article.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update favorite', 'error': str(e)}), 500

@articles_bp.route('/<int:article_id>/favorite', methods=['DELETE'])
@jwt_required()
def remove_from_favorites(article_id):
    """Remove article from favorites"""
    try:
        current_user_id = get_jwt_identity()
        
        user_article = UserArticle.query.filter_by(
            user_id=current_user_id,
            article_id=article_id
        ).first()
        
        if user_article:
            user_article.remove_from_favorites()
            db.session.commit()
        
        return jsonify({'message': 'Article removed from favorites'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to remove from favorites', 'error': str(e)}), 500

@articles_bp.route('/search', methods=['GET'])
@jwt_required()
def search_articles():
    """Search articles"""
    try:
        current_user_id = get_jwt_identity()
        
        query = request.args.get('q', '').strip()
        search_type = request.args.get('type', 'all')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 25))
        
        if not query:
            return jsonify({'message': 'Search query is required'}), 400
        
        results = []
        total = 0
        
        if search_type in ['all', 'articles']:
            # Search articles
            articles = Article.search(current_user_id, query)
            for article in articles:
                results.append({
                    'type': 'article',
                    'id': article.id,
                    'title': article.title,
                    'description': article.description,
                    'content': article.content[:200] + '...' if article.content else None,
                    'url': article.url,
                    'author': article.author,
                    'published_at': article.published_at.isoformat() if article.published_at else None,
                    'source': article.feed.title if article.feed else None
                })
        
        if search_type in ['all', 'feeds']:
            # Search feeds
            feeds = Feed.query.filter(
                Feed.user_id == current_user_id,
                (Feed.title.contains(query) | Feed.description.contains(query))
            ).all()
            
            for feed in feeds:
                results.append({
                    'type': 'feed',
                    'id': feed.id,
                    'title': feed.title,
                    'description': feed.description,
                    'url': feed.url,
                    'category': feed.category,
                    'tags': feed.tags
                })
        
        # Pagination
        total = len(results)
        start = (page - 1) * per_page
        end = start + per_page
        paginated_results = results[start:end]
        
        return jsonify({
            'results': paginated_results,
            'total': total,
            'page': page,
            'per_page': per_page,
            'query': query,
            'searchTime': '0.1'  # Mock search time
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Search failed', 'error': str(e)}), 500

@articles_bp.route('/bulk/read', methods=['PUT'])
@jwt_required()
def bulk_mark_as_read():
    """Bulk mark articles as read"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        article_ids = data.get('articleIds', [])
        
        if not article_ids:
            return jsonify({'message': 'No articles specified'}), 400
        
        # Verify user has access to all articles
        accessible_articles = db.session.query(Article).join(Feed).filter(
            Article.id.in_(article_ids),
            Feed.user_id == current_user_id
        ).all()
        
        updated_count = 0
        for article in accessible_articles:
            article.mark_as_read(current_user_id)
            updated_count += 1
        
        return jsonify({
            'message': f'Marked {updated_count} articles as read'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Bulk update failed', 'error': str(e)}), 500

@articles_bp.route('/<int:article_id>/notes', methods=['POST'])
@jwt_required()
def add_note(article_id):
    """Add note to article"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        note_text = data.get('note', '').strip()
        if not note_text:
            return jsonify({'message': 'Note text is required'}), 400
        
        # Get or create user article
        user_article = UserArticle.get_or_create(current_user_id, article_id)
        user_article.notes = note_text
        
        db.session.commit()
        
        return jsonify({
            'message': 'Note added successfully',
            'user_article': user_article.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to add note', 'error': str(e)}), 500

@articles_bp.route('/<int:article_id>/highlights', methods=['POST'])
@jwt_required()
def add_highlight(article_id):
    """Add highlight to article"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        highlight_text = data.get('text', '').strip()
        color = data.get('color', 'yellow')
        position = data.get('position')
        
        if not highlight_text:
            return jsonify({'message': 'Highlight text is required'}), 400
        
        # Get or create user article
        user_article = UserArticle.get_or_create(current_user_id, article_id)
        highlight = user_article.add_highlight(highlight_text, color, position)
        
        return jsonify({
            'message': 'Highlight added successfully',
            'highlight': highlight
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to add highlight', 'error': str(e)}), 500

@articles_bp.route('/<int:article_id>/highlights/<int:highlight_id>', methods=['DELETE'])
@jwt_required()
def delete_highlight(article_id, highlight_id):
    """Delete highlight from article"""
    try:
        current_user_id = get_jwt_identity()
        
        user_article = UserArticle.query.filter_by(
            user_id=current_user_id,
            article_id=article_id
        ).first()
        
        if user_article:
            user_article.remove_highlight(highlight_id)
        
        return jsonify({'message': 'Highlight deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to delete highlight', 'error': str(e)}), 500

@articles_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_article_stats():
    """Get article statistics for current user"""
    try:
        current_user_id = get_jwt_identity()
        
        # Get user's articles through their feeds
        total_articles = db.session.query(Article).join(Feed).filter(
            Feed.user_id == current_user_id
        ).count()
        
        # Get read/unread counts
        read_count = UserArticle.query.filter_by(
            user_id=current_user_id,
            is_read=True
        ).count()
        
        unread_count = total_articles - read_count
        
        # Get favorite count
        favorite_count = UserArticle.query.filter_by(
            user_id=current_user_id,
            is_favorite=True
        ).count()
        
        stats = {
            'total_articles': total_articles,
            'read_articles': read_count,
            'unread_articles': unread_count,
            'favorite_articles': favorite_count,
            'reading_progress': round((read_count / total_articles * 100) if total_articles > 0 else 0, 1)
        }
        
        return jsonify({'stats': stats}), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get stats', 'error': str(e)}), 500