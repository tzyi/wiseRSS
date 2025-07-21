from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from email_validator import validate_email, EmailNotValidError
from app import db
from app.models.user import User
from app.models.category import Category

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        username = data['username'].strip()
        email = data['email'].strip().lower()
        password = data['password']
        
        # Validate input
        if len(username) < 3:
            return jsonify({'message': 'Username must be at least 3 characters'}), 400
        
        if len(password) < 6:
            return jsonify({'message': 'Password must be at least 6 characters'}), 400
        
        # Validate email
        try:
            validate_email(email)
        except EmailNotValidError:
            return jsonify({'message': 'Invalid email address'}), 400
        
        # Check if user already exists
        if User.find_by_username(username):
            return jsonify({'message': 'Username already exists'}), 400
        
        if User.find_by_email(email):
            return jsonify({'message': 'Email already registered'}), 400
        
        # Create new user
        user = User(
            username=username,
            email=email,
            display_name=data.get('display_name', username)
        )
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        # Create default categories for user
        Category.create_default_categories(user.id)
        
        # Generate tokens
        tokens = user.generate_tokens()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict(include_sensitive=True),
            'token': tokens['access_token'],
            'refresh_token': tokens['refresh_token']
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Registration failed', 'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('username') or not data.get('password'):
            return jsonify({'message': 'Username and password are required'}), 400
        
        username = data['username'].strip()
        password = data['password']
        
        # Find user by username or email
        user = User.find_by_username(username) or User.find_by_email(username)
        
        if not user or not user.check_password(password):
            return jsonify({'message': 'Invalid username or password'}), 401
        
        if not user.is_active:
            return jsonify({'message': 'Account is disabled'}), 401
        
        # Update last login
        user.update_last_login()
        
        # Generate tokens
        tokens = user.generate_tokens()
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(include_sensitive=True),
            'token': tokens['access_token'],
            'refresh_token': tokens['refresh_token']
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Login failed', 'error': str(e)}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return jsonify({'message': 'User not found or inactive'}), 404
        
        # Generate new access token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'token': access_token,
            'user': user.to_dict(include_sensitive=True)
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Token refresh failed', 'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        return jsonify({
            'user': user.to_dict(include_sensitive=True)
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get user info', 'error': str(e)}), 500

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        allowed_fields = [
            'display_name', 'bio', 'timezone', 'language', 'theme',
            'articles_per_page', 'auto_mark_read', 'email_notifications'
        ]
        
        for field in allowed_fields:
            if field in data:
                setattr(user, field, data[field])
        
        # Validate email if provided
        if 'email' in data:
            email = data['email'].strip().lower()
            try:
                validate_email(email)
                # Check if email is already taken by another user
                existing_user = User.find_by_email(email)
                if existing_user and existing_user.id != user.id:
                    return jsonify({'message': 'Email already in use'}), 400
                user.email = email
            except EmailNotValidError:
                return jsonify({'message': 'Invalid email address'}), 400
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict(include_sensitive=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Profile update failed', 'error': str(e)}), 500

@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    """Change user password"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        data = request.get_json()
        
        # Validate required fields
        if not data.get('current_password') or not data.get('new_password'):
            return jsonify({'message': 'Current password and new password are required'}), 400
        
        current_password = data['current_password']
        new_password = data['new_password']
        
        # Verify current password
        if not user.check_password(current_password):
            return jsonify({'message': 'Current password is incorrect'}), 400
        
        # Validate new password
        if len(new_password) < 6:
            return jsonify({'message': 'New password must be at least 6 characters'}), 400
        
        # Update password
        user.set_password(new_password)
        db.session.commit()
        
        return jsonify({'message': 'Password changed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Password change failed', 'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user (client-side token removal)"""
    return jsonify({'message': 'Logout successful'}), 200

@auth_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_user_stats():
    """Get user statistics"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        stats = {
            'feed_count': user.get_feed_count(),
            'unread_count': user.get_unread_count(),
            'favorite_count': user.get_favorite_count(),
            'total_articles': user.user_articles.count(),
            'read_articles': user.user_articles.filter_by(is_read=True).count()
        }
        
        return jsonify({'stats': stats}), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get stats', 'error': str(e)}), 500