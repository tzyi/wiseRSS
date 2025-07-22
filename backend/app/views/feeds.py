from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.feed import Feed
from app.models.article import Article
from sqlalchemy import or_, desc, func

feeds_bp = Blueprint('feeds', __name__)

@feeds_bp.route('', methods=['GET'])
@jwt_required()
def get_feeds():
    """Get user's feeds with optional filtering"""
    try:
        user_id = int(get_jwt_identity())
        
        # Get query parameters
        search = request.args.get('search', '').strip()
        status = request.args.get('status', '').strip()
        category = request.args.get('category', '').strip()
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        # Build query
        query = Feed.query.filter_by(user_id=user_id)
        
        # Apply search filter
        if search:
            query = query.filter(
                or_(
                    Feed.title.contains(search),
                    Feed.description.contains(search),
                    Feed.url.contains(search)
                )
            )
        
        # Apply status filter
        if status == 'active':
            query = query.filter(Feed.is_active == True, Feed.fetch_errors <= 5)
        elif status == 'inactive':
            query = query.filter(Feed.is_active == False)
        elif status == 'pending':
            query = query.filter(Feed.last_fetched.is_(None))
        elif status == 'error':
            query = query.filter(Feed.fetch_errors > 5)
        
        # Apply category filter
        if category:
            query = query.filter(Feed.category == category)
        
        # Order by last updated
        query = query.order_by(desc(Feed.updated_at))
        
        # Paginate
        feeds = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'feeds': [feed.to_dict() for feed in feeds.items],
            'pagination': {
                'page': feeds.page,
                'pages': feeds.pages,
                'per_page': feeds.per_page,
                'total': feeds.total,
                'has_prev': feeds.has_prev,
                'has_next': feeds.has_next
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@feeds_bp.route('/<int:feed_id>', methods=['GET'])
@jwt_required()
def get_feed(feed_id):
    """Get specific feed"""
    try:
        user_id = int(get_jwt_identity())
        
        feed = Feed.query.filter_by(id=feed_id, user_id=user_id).first()
        if not feed:
            return jsonify({'error': 'Feed not found'}), 404
        
        include_articles = request.args.get('include_articles', 'false').lower() == 'true'
        
        return jsonify({'feed': feed.to_dict(include_articles=include_articles)}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@feeds_bp.route('', methods=['POST'])
@jwt_required()
def create_feed():
    """Create new feed"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        title = data.get('title', '').strip()
        url = data.get('url', '').strip()
        
        if not title or not url:
            return jsonify({'error': 'Title and URL are required'}), 400
        
        # Check if feed already exists for this user
        existing_feed = Feed.query.filter_by(user_id=user_id, url=url).first()
        if existing_feed:
            return jsonify({'error': 'Feed already exists'}), 409
        
        # Create new feed
        feed = Feed(
            user_id=user_id,
            title=title,
            url=url,
            description=data.get('description', ''),
            site_url=data.get('site_url', ''),
            category=data.get('category', ''),
            language=data.get('language', 'zh-TW'),
            is_active=data.get('is_active', True),
            auto_update=data.get('auto_update', True),
            update_interval=data.get('update_interval', 3600)
        )
        
        # Set tags if provided
        if 'tags' in data and isinstance(data['tags'], list):
            feed.set_tags(data['tags'])
        
        db.session.add(feed)
        db.session.commit()
        
        return jsonify({
            'message': 'Feed created successfully',
            'feed': feed.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@feeds_bp.route('/<int:feed_id>', methods=['PUT'])
@jwt_required()
def update_feed(feed_id):
    """Update feed"""
    try:
        user_id = int(get_jwt_identity())
        
        feed = Feed.query.filter_by(id=feed_id, user_id=user_id).first()
        if not feed:
            return jsonify({'error': 'Feed not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Update allowed fields
        allowed_fields = [
            'title', 'description', 'site_url', 'category', 'language',
            'is_active', 'auto_update', 'update_interval'
        ]
        
        for field in allowed_fields:
            if field in data:
                setattr(feed, field, data[field])
        
        # Handle tags separately
        if 'tags' in data and isinstance(data['tags'], list):
            feed.set_tags(data['tags'])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Feed updated successfully',
            'feed': feed.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@feeds_bp.route('/<int:feed_id>', methods=['DELETE'])
@jwt_required()
def delete_feed(feed_id):
    """Delete feed and all associated articles"""
    try:
        user_id = int(get_jwt_identity())
        
        feed = Feed.query.filter_by(id=feed_id, user_id=user_id).first()
        if not feed:
            return jsonify({'error': 'Feed not found'}), 404
        
        feed_title = feed.title
        
        # Delete the feed (cascades to articles and user_articles)
        db.session.delete(feed)
        db.session.commit()
        
        return jsonify({'message': f'Feed "{feed_title}" deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@feeds_bp.route('/<int:feed_id>/refresh', methods=['POST'])
@jwt_required()
def refresh_feed(feed_id):
    """Manually refresh a feed"""
    try:
        user_id = int(get_jwt_identity())
        
        feed = Feed.query.filter_by(id=feed_id, user_id=user_id).first()
        if not feed:
            return jsonify({'error': 'Feed not found'}), 404
        
        # TODO: Implement RSS fetching logic here
        # This would typically be handled by a background task
        # For now, we'll just mark it as refreshed
        
        from datetime import datetime
        feed.last_fetched = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Feed refresh initiated',
            'feed': feed.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@feeds_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_feed_stats():
    """Get feed statistics for the user"""
    try:
        user_id = int(get_jwt_identity())
        
        # Get feed counts by status
        total_feeds = Feed.query.filter_by(user_id=user_id).count()
        active_feeds = Feed.query.filter_by(user_id=user_id, is_active=True).filter(Feed.fetch_errors <= 5).count()
        inactive_feeds = Feed.query.filter_by(user_id=user_id, is_active=False).count()
        pending_feeds = Feed.query.filter_by(user_id=user_id).filter(Feed.last_fetched.is_(None)).count()
        error_feeds = Feed.query.filter_by(user_id=user_id).filter(Feed.fetch_errors > 5).count()
        
        # Get article count for today
        from datetime import datetime, timedelta
        today = datetime.utcnow().date()
        new_articles_today = db.session.query(Article).join(Feed).filter(
            Feed.user_id == user_id,
            func.date(Article.created_at) == today
        ).count()
        
        return jsonify({
            'total': total_feeds,
            'active': active_feeds,
            'inactive': inactive_feeds,
            'pending': pending_feeds,
            'error': error_feeds,
            'new_articles_today': new_articles_today
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@feeds_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_categories():
    """Get list of categories used by user's feeds"""
    try:
        user_id = int(get_jwt_identity())
        
        categories = db.session.query(Feed.category, func.count(Feed.id).label('count')).filter(
            Feed.user_id == user_id,
            Feed.category.isnot(None),
            Feed.category != ''
        ).group_by(Feed.category).all()
        
        return jsonify({
            'categories': [
                {'name': category, 'count': count} 
                for category, count in categories
            ]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500