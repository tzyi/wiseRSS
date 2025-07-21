from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.feed import Feed
from app.models.user import User
from app.services.feed_service import FeedService

feeds_bp = Blueprint('feeds', __name__)

@feeds_bp.route('', methods=['GET'])
@jwt_required()
def get_feeds():
    """Get all feeds for current user"""
    try:
        current_user_id = get_jwt_identity()
        
        # Get query parameters
        status = request.args.get('status')
        category = request.args.get('category')
        search = request.args.get('search')
        
        feeds = Feed.get_by_user(current_user_id, status=status)
        
        # Apply additional filters
        if category:
            feeds = [f for f in feeds if f.category == category]
        
        if search:
            search_lower = search.lower()
            feeds = [f for f in feeds if 
                    search_lower in f.title.lower() or 
                    search_lower in (f.description or '').lower() or
                    search_lower in f.url.lower()]
        
        return jsonify({
            'feeds': [feed.to_dict() for feed in feeds],
            'total': len(feeds)
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get feeds', 'error': str(e)}), 500

@feeds_bp.route('/<int:feed_id>', methods=['GET'])
@jwt_required()
def get_feed(feed_id):
    """Get single feed by ID"""
    try:
        current_user_id = get_jwt_identity()
        feed = Feed.query.filter_by(id=feed_id, user_id=current_user_id).first()
        
        if not feed:
            return jsonify({'message': 'Feed not found'}), 404
        
        return jsonify({'feed': feed.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get feed', 'error': str(e)}), 500

@feeds_bp.route('', methods=['POST'])
@jwt_required()
def create_feed():
    """Create new feed"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        if not data.get('url'):
            return jsonify({'message': 'Feed URL is required'}), 400
        
        if not data.get('title'):
            return jsonify({'message': 'Feed title is required'}), 400
        
        # Check if feed URL already exists for this user
        existing_feed = Feed.query.filter_by(
            user_id=current_user_id,
            url=data['url']
        ).first()
        
        if existing_feed:
            return jsonify({'message': 'Feed already exists'}), 400
        
        # Create new feed
        feed = Feed(
            user_id=current_user_id,
            title=data['title'],
            url=data['url'],
            description=data.get('description'),
            category=data.get('category'),
            tags=data.get('tags', []),
            is_active=data.get('isActive', True),
            auto_update=data.get('autoUpdate', True),
            update_frequency=data.get('updateFrequency', 'auto')
        )
        
        db.session.add(feed)
        db.session.commit()
        
        # Try to fetch initial articles
        try:
            FeedService.update_feed(feed.id)
        except Exception as e:
            # Log error but don't fail the creation
            print(f"Failed to fetch initial articles for feed {feed.id}: {e}")
        
        return jsonify({
            'message': 'Feed created successfully',
            'feed': feed.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to create feed', 'error': str(e)}), 500

@feeds_bp.route('/<int:feed_id>', methods=['PUT'])
@jwt_required()
def update_feed(feed_id):
    """Update feed"""
    try:
        current_user_id = get_jwt_identity()
        feed = Feed.query.filter_by(id=feed_id, user_id=current_user_id).first()
        
        if not feed:
            return jsonify({'message': 'Feed not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        allowed_fields = [
            'title', 'description', 'category', 'tags', 'is_active',
            'auto_update', 'update_frequency'
        ]
        
        for field in allowed_fields:
            if field in data:
                setattr(feed, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Feed updated successfully',
            'feed': feed.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update feed', 'error': str(e)}), 500

@feeds_bp.route('/<int:feed_id>', methods=['DELETE'])
@jwt_required()
def delete_feed(feed_id):
    """Delete feed"""
    try:
        current_user_id = get_jwt_identity()
        feed = Feed.query.filter_by(id=feed_id, user_id=current_user_id).first()
        
        if not feed:
            return jsonify({'message': 'Feed not found'}), 404
        
        db.session.delete(feed)
        db.session.commit()
        
        return jsonify({'message': 'Feed deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to delete feed', 'error': str(e)}), 500

@feeds_bp.route('/<int:feed_id>/refresh', methods=['POST'])
@jwt_required()
def refresh_feed(feed_id):
    """Manually refresh feed"""
    try:
        current_user_id = get_jwt_identity()
        feed = Feed.query.filter_by(id=feed_id, user_id=current_user_id).first()
        
        if not feed:
            return jsonify({'message': 'Feed not found'}), 404
        
        # Update feed
        result = FeedService.update_feed(feed_id)
        
        if result['success']:
            return jsonify({
                'message': 'Feed refreshed successfully',
                'articles_added': result.get('articles_added', 0)
            }), 200
        else:
            return jsonify({
                'message': 'Failed to refresh feed',
                'error': result.get('error')
            }), 400
        
    except Exception as e:
        return jsonify({'message': 'Failed to refresh feed', 'error': str(e)}), 500

@feeds_bp.route('/validate', methods=['POST'])
@jwt_required()
def validate_feed():
    """Validate RSS URL"""
    try:
        data = request.get_json()
        url = data.get('url')
        
        if not url:
            return jsonify({'message': 'URL is required'}), 400
        
        result = FeedService.validate_rss_url(url)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'message': 'Validation failed', 'error': str(e)}), 500

@feeds_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_feed_stats():
    """Get feed statistics for current user"""
    try:
        current_user_id = get_jwt_identity()
        
        feeds = Feed.query.filter_by(user_id=current_user_id).all()
        
        stats = {
            'totalFeeds': len(feeds),
            'activeFeeds': len([f for f in feeds if f.status == 'active']),
            'inactiveFeeds': len([f for f in feeds if f.status == 'inactive']),
            'pendingFeeds': len([f for f in feeds if f.status == 'pending']),
            'errorFeeds': len([f for f in feeds if f.status == 'error']),
            'todayArticles': 0  # This would need a more complex query
        }
        
        # Calculate today's articles
        from datetime import datetime, timedelta
        from app.models.article import Article
        
        today = datetime.utcnow().date()
        yesterday = today - timedelta(days=1)
        
        feed_ids = [f.id for f in feeds]
        if feed_ids:
            today_count = Article.query.filter(
                Article.feed_id.in_(feed_ids),
                Article.created_at >= yesterday
            ).count()
            stats['todayArticles'] = today_count
        
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get stats', 'error': str(e)}), 500

@feeds_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_categories():
    """Get available categories"""
    try:
        current_user_id = get_jwt_identity()
        
        # Get categories from user's feeds
        feeds = Feed.query.filter_by(user_id=current_user_id).all()
        categories = list(set([f.category for f in feeds if f.category]))
        
        # Add default categories if none exist
        if not categories:
            categories = ['科技', '商業', '設計', '新聞', '娛樂']
        
        return jsonify({'categories': sorted(categories)}), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get categories', 'error': str(e)}), 500

@feeds_bp.route('/bulk', methods=['PUT'])
@jwt_required()
def bulk_update_feeds():
    """Bulk update feeds"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        feed_ids = data.get('feedIds', [])
        update_data = data.get('updateData', {})
        
        if not feed_ids:
            return jsonify({'message': 'No feeds specified'}), 400
        
        # Update feeds
        feeds = Feed.query.filter(
            Feed.id.in_(feed_ids),
            Feed.user_id == current_user_id
        ).all()
        
        for feed in feeds:
            for field, value in update_data.items():
                if hasattr(feed, field):
                    setattr(feed, field, value)
        
        db.session.commit()
        
        return jsonify({
            'message': f'Updated {len(feeds)} feeds successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Bulk update failed', 'error': str(e)}), 500

@feeds_bp.route('/bulk', methods=['DELETE'])
@jwt_required()
def bulk_delete_feeds():
    """Bulk delete feeds"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        feed_ids = data.get('feedIds', [])
        
        if not feed_ids:
            return jsonify({'message': 'No feeds specified'}), 400
        
        # Delete feeds
        deleted_count = Feed.query.filter(
            Feed.id.in_(feed_ids),
            Feed.user_id == current_user_id
        ).delete(synchronize_session=False)
        
        db.session.commit()
        
        return jsonify({
            'message': f'Deleted {deleted_count} feeds successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Bulk delete failed', 'error': str(e)}), 500