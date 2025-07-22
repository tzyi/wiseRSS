from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.feed import Feed
from app.models.article import Article
from app.models.user_article import UserArticle
from sqlalchemy import or_, desc, func, and_

articles_bp = Blueprint('articles', __name__)

@articles_bp.route('', methods=['GET'])
@jwt_required()
def get_articles():
    """Get user's articles with filtering and pagination"""
    try:
        user_id = get_jwt_identity()
        
        # Get query parameters
        status = request.args.get('status', 'later').strip()  # later, shortlist, archive
        is_read = request.args.get('is_read', '').strip()
        is_bookmarked = request.args.get('is_bookmarked', '').strip()
        feed_id = request.args.get('feed_id', '').strip()
        category = request.args.get('category', '').strip()
        page = int(request.args.get('page', 1))
        per_page = min(int(request.args.get('per_page', 20)), 100)
        
        # Build base query - get articles from user's feeds
        query = db.session.query(Article).join(Feed).filter(Feed.user_id == user_id)
        
        # Left join with UserArticle to get user-specific data
        query = query.outerjoin(UserArticle, and_(
            UserArticle.article_id == Article.id,
            UserArticle.user_id == user_id
        ))
        
        # Apply status filter based on reading_status
        if status == 'later':
            query = query.filter(or_(
                UserArticle.reading_status == 'later',
                UserArticle.reading_status.is_(None)  # Default status
            ))
        elif status == 'shortlist':
            query = query.filter(UserArticle.reading_status == 'shortlist')
        elif status == 'archive':
            query = query.filter(UserArticle.reading_status == 'archive')
        
        # Apply read filter
        if is_read == 'true':
            query = query.filter(UserArticle.is_read == True)
        elif is_read == 'false':
            query = query.filter(or_(
                UserArticle.is_read == False,
                UserArticle.is_read.is_(None)
            ))
        
        # Apply bookmark filter
        if is_bookmarked == 'true':
            query = query.filter(UserArticle.is_bookmarked == True)
        
        # Apply feed filter
        if feed_id:
            query = query.filter(Article.feed_id == int(feed_id))
        
        # Apply category filter
        if category:
            query = query.filter(Feed.category == category)
        
        # Order by published date (newest first)
        query = query.order_by(desc(Article.published_at))
        
        # Paginate
        articles = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            'articles': [article.to_dict(user_id=user_id) for article in articles.items],
            'pagination': {
                'page': articles.page,
                'pages': articles.pages,
                'per_page': articles.per_page,
                'total': articles.total,
                'has_prev': articles.has_prev,
                'has_next': articles.has_next
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@articles_bp.route('/<int:article_id>', methods=['GET'])
@jwt_required()
def get_article(article_id):
    """Get specific article"""
    try:
        user_id = get_jwt_identity()
        
        # Verify user has access to this article through their feeds
        article = db.session.query(Article).join(Feed).filter(
            Article.id == article_id,
            Feed.user_id == user_id
        ).first()
        
        if not article:
            return jsonify({'error': 'Article not found'}), 404
        
        return jsonify({'article': article.to_dict(user_id=user_id)}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@articles_bp.route('/<int:article_id>/read', methods=['PUT'])
@jwt_required()
def mark_as_read(article_id):
    """Mark article as read"""
    try:
        user_id = get_jwt_identity()
        
        # Verify user has access to this article
        article = db.session.query(Article).join(Feed).filter(
            Article.id == article_id,
            Feed.user_id == user_id
        ).first()
        
        if not article:
            return jsonify({'error': 'Article not found'}), 404
        
        # Get or create UserArticle
        user_article = UserArticle.get_or_create(user_id, article_id)
        user_article.mark_as_read()
        
        return jsonify({
            'message': 'Article marked as read',
            'article': article.to_dict(user_id=user_id)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@articles_bp.route('/<int:article_id>/unread', methods=['PUT'])
@jwt_required()
def mark_as_unread(article_id):
    """Mark article as unread"""
    try:
        user_id = get_jwt_identity()
        
        # Verify user has access to this article
        article = db.session.query(Article).join(Feed).filter(
            Article.id == article_id,
            Feed.user_id == user_id
        ).first()
        
        if not article:
            return jsonify({'error': 'Article not found'}), 404
        
        # Get or create UserArticle
        user_article = UserArticle.get_or_create(user_id, article_id)
        user_article.mark_as_unread()
        
        return jsonify({
            'message': 'Article marked as unread',
            'article': article.to_dict(user_id=user_id)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@articles_bp.route('/<int:article_id>/bookmark', methods=['PUT'])
@jwt_required()
def toggle_bookmark(article_id):
    """Toggle article bookmark status"""
    try:
        user_id = get_jwt_identity()
        
        # Verify user has access to this article
        article = db.session.query(Article).join(Feed).filter(
            Article.id == article_id,
            Feed.user_id == user_id
        ).first()
        
        if not article:
            return jsonify({'error': 'Article not found'}), 404
        
        # Get or create UserArticle
        user_article = UserArticle.get_or_create(user_id, article_id)
        is_bookmarked = user_article.toggle_bookmark()
        
        return jsonify({
            'message': f'Article {"bookmarked" if is_bookmarked else "unbookmarked"}',
            'is_bookmarked': is_bookmarked,
            'article': article.to_dict(user_id=user_id)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@articles_bp.route('/<int:article_id>/status', methods=['PUT'])
@jwt_required()
def update_reading_status(article_id):
    """Update article reading status"""
    try:
        user_id = get_jwt_identity()
        
        # Verify user has access to this article
        article = db.session.query(Article).join(Feed).filter(
            Article.id == article_id,
            Feed.user_id == user_id
        ).first()
        
        if not article:
            return jsonify({'error': 'Article not found'}), 404
        
        data = request.get_json()
        if not data or 'status' not in data:
            return jsonify({'error': 'Status is required'}), 400
        
        status = data['status']
        valid_statuses = ['unread', 'reading', 'read', 'later', 'shortlist', 'archive']
        
        if status not in valid_statuses:
            return jsonify({'error': f'Invalid status. Must be one of: {valid_statuses}'}), 400
        
        # Get or create UserArticle
        user_article = UserArticle.get_or_create(user_id, article_id)
        user_article.set_reading_status(status)
        
        return jsonify({
            'message': f'Article status updated to {status}',
            'article': article.to_dict(user_id=user_id)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@articles_bp.route('/<int:article_id>/rating', methods=['PUT'])
@jwt_required()
def rate_article(article_id):
    """Rate an article (1-5 stars)"""
    try:
        user_id = get_jwt_identity()
        
        # Verify user has access to this article
        article = db.session.query(Article).join(Feed).filter(
            Article.id == article_id,
            Feed.user_id == user_id
        ).first()
        
        if not article:
            return jsonify({'error': 'Article not found'}), 404
        
        data = request.get_json()
        if not data or 'rating' not in data:
            return jsonify({'error': 'Rating is required'}), 400
        
        rating = data['rating']
        if not isinstance(rating, int) or rating < 1 or rating > 5:
            return jsonify({'error': 'Rating must be an integer between 1 and 5'}), 400
        
        # Get or create UserArticle
        user_article = UserArticle.get_or_create(user_id, article_id)
        user_article.set_rating(rating)
        
        return jsonify({
            'message': f'Article rated {rating} stars',
            'article': article.to_dict(user_id=user_id)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@articles_bp.route('/<int:article_id>/notes', methods=['GET'])
@jwt_required()
def get_notes(article_id):
    """Get notes for an article"""
    try:
        user_id = get_jwt_identity()
        
        user_article = UserArticle.query.filter_by(
            user_id=user_id,
            article_id=article_id
        ).first()
        
        if not user_article:
            return jsonify({'notes': []}), 200
        
        # For simplicity, we're storing notes as a single text field
        # In a real app, you might have a separate Notes table
        notes = []
        if user_article.notes:
            notes.append({
                'id': 1,
                'content': user_article.notes,
                'created_at': user_article.updated_at.isoformat()
            })
        
        return jsonify({'notes': notes}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@articles_bp.route('/<int:article_id>/notes', methods=['POST'])
@jwt_required()
def add_note(article_id):
    """Add note to an article"""
    try:
        user_id = get_jwt_identity()
        
        # Verify user has access to this article
        article = db.session.query(Article).join(Feed).filter(
            Article.id == article_id,
            Feed.user_id == user_id
        ).first()
        
        if not article:
            return jsonify({'error': 'Article not found'}), 404
        
        data = request.get_json()
        if not data or 'note' not in data:
            return jsonify({'error': 'Note content is required'}), 400
        
        note_content = data['note'].strip()
        if not note_content:
            return jsonify({'error': 'Note content cannot be empty'}), 400
        
        # Get or create UserArticle
        user_article = UserArticle.get_or_create(user_id, article_id)
        user_article.add_note(note_content)
        
        return jsonify({
            'message': 'Note added successfully',
            'note': {
                'id': 1,
                'content': note_content,
                'created_at': user_article.updated_at.isoformat()
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@articles_bp.route('/<int:article_id>/highlights', methods=['GET'])
@jwt_required()
def get_highlights(article_id):
    """Get highlights for an article"""
    try:
        user_id = get_jwt_identity()
        
        user_article = UserArticle.query.filter_by(
            user_id=user_id,
            article_id=article_id
        ).first()
        
        if not user_article:
            return jsonify({'highlights': []}), 200
        
        highlights = user_article.get_highlights()
        return jsonify({'highlights': highlights}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@articles_bp.route('/<int:article_id>/highlights', methods=['POST'])
@jwt_required()
def add_highlight(article_id):
    """Add highlight to an article"""
    try:
        user_id = get_jwt_identity()
        
        # Verify user has access to this article
        article = db.session.query(Article).join(Feed).filter(
            Article.id == article_id,
            Feed.user_id == user_id
        ).first()
        
        if not article:
            return jsonify({'error': 'Article not found'}), 404
        
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'Highlighted text is required'}), 400
        
        text = data['text'].strip()
        if not text:
            return jsonify({'error': 'Highlighted text cannot be empty'}), 400
        
        start_pos = data.get('start_pos')
        end_pos = data.get('end_pos')
        color = data.get('color', 'yellow')
        
        # Get or create UserArticle
        user_article = UserArticle.get_or_create(user_id, article_id)
        highlight = user_article.add_highlight(text, start_pos, end_pos, color)
        
        return jsonify({
            'message': 'Highlight added successfully',
            'highlight': highlight
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@articles_bp.route('/search', methods=['GET'])
@jwt_required()
def search_articles():
    """Search articles"""
    try:
        user_id = get_jwt_identity()
        
        # Get query parameters
        q = request.args.get('q', '').strip()
        if not q:
            return jsonify({'error': 'Query parameter "q" is required'}), 400
        
        feed_id = request.args.get('feed_id', '').strip()
        category = request.args.get('category', '').strip()
        page = int(request.args.get('page', 1))
        per_page = min(int(request.args.get('per_page', 20)), 100)
        
        # Build search query
        query = db.session.query(Article).join(Feed).filter(Feed.user_id == user_id)
        
        # Add text search
        query = query.filter(or_(
            Article.title.contains(q),
            Article.summary.contains(q),
            Article.content.contains(q),
            Article.author.contains(q)
        ))
        
        # Apply filters
        if feed_id:
            query = query.filter(Article.feed_id == int(feed_id))
        
        if category:
            query = query.filter(Feed.category == category)
        
        # Order by relevance (for now, just use published date)
        query = query.order_by(desc(Article.published_at))
        
        # Paginate
        articles = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            'query': q,
            'articles': [article.to_dict(user_id=user_id) for article in articles.items],
            'pagination': {
                'page': articles.page,
                'pages': articles.pages,
                'per_page': articles.per_page,
                'total': articles.total,
                'has_prev': articles.has_prev,
                'has_next': articles.has_next
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500