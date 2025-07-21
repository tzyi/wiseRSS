from datetime import datetime
from app import db, bcrypt
from flask_jwt_extended import create_access_token, create_refresh_token

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    
    # Profile information
    display_name = db.Column(db.String(100))
    avatar_url = db.Column(db.String(255))
    bio = db.Column(db.Text)
    
    # Settings
    timezone = db.Column(db.String(50), default='UTC')
    language = db.Column(db.String(10), default='zh-TW')
    theme = db.Column(db.String(20), default='dark')
    
    # Preferences
    articles_per_page = db.Column(db.Integer, default=25)
    auto_mark_read = db.Column(db.Boolean, default=False)
    email_notifications = db.Column(db.Boolean, default=True)
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    last_login = db.Column(db.DateTime)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    feeds = db.relationship('Feed', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    user_articles = db.relationship('UserArticle', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        """Check if provided password matches hash"""
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def generate_tokens(self):
        """Generate JWT access and refresh tokens"""
        access_token = create_access_token(identity=self.id)
        refresh_token = create_refresh_token(identity=self.id)
        return {
            'access_token': access_token,
            'refresh_token': refresh_token
        }
    
    def to_dict(self, include_sensitive=False):
        """Convert user to dictionary"""
        data = {
            'id': self.id,
            'username': self.username,
            'email': self.email if include_sensitive else None,
            'display_name': self.display_name,
            'avatar_url': self.avatar_url,
            'bio': self.bio,
            'timezone': self.timezone,
            'language': self.language,
            'theme': self.theme,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_sensitive:
            data.update({
                'articles_per_page': self.articles_per_page,
                'auto_mark_read': self.auto_mark_read,
                'email_notifications': self.email_notifications
            })
        
        return data
    
    @staticmethod
    def find_by_username(username):
        """Find user by username"""
        return User.query.filter_by(username=username).first()
    
    @staticmethod
    def find_by_email(email):
        """Find user by email"""
        return User.query.filter_by(email=email).first()
    
    def update_last_login(self):
        """Update last login timestamp"""
        self.last_login = datetime.utcnow()
        db.session.commit()
    
    def get_feed_count(self):
        """Get total number of feeds"""
        return self.feeds.count()
    
    def get_unread_count(self):
        """Get total number of unread articles"""
        return self.user_articles.filter_by(is_read=False).count()
    
    def get_favorite_count(self):
        """Get total number of favorite articles"""
        return self.user_articles.filter_by(is_favorite=True).count()