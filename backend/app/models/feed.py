from datetime import datetime
from app import db
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy import Text

class Feed(db.Model):
    __tablename__ = 'feeds'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    # Basic information
    title = db.Column(db.String(255), nullable=False)
    url = db.Column(db.String(500), nullable=False)
    description = db.Column(Text)
    website_url = db.Column(db.String(500))
    
    # Feed metadata
    language = db.Column(db.String(10))
    category = db.Column(db.String(50))
    tags = db.Column(db.JSON)  # Store as JSON array
    
    # Visual elements
    icon_url = db.Column(db.String(500))
    image_url = db.Column(db.String(500))
    
    # Status and settings
    status = db.Column(db.String(20), default='active')  # active, inactive, pending, error
    is_active = db.Column(db.Boolean, default=True)
    auto_update = db.Column(db.Boolean, default=True)
    update_frequency = db.Column(db.String(20), default='auto')  # auto, hourly, daily, weekly, manual
    
    # Update information
    last_updated = db.Column(db.DateTime)
    last_checked = db.Column(db.DateTime)
    last_error = db.Column(Text)
    error_count = db.Column(db.Integer, default=0)
    
    # Statistics
    total_articles = db.Column(db.Integer, default=0)
    avg_articles_per_day = db.Column(db.Float, default=0.0)
    
    # Feed parsing info
    etag = db.Column(db.String(255))  # For conditional requests
    last_modified = db.Column(db.String(255))  # For conditional requests
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    articles = db.relationship('Article', backref='feed', lazy='dynamic', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Feed {self.title}>'
    
    def to_dict(self, include_stats=True):
        """Convert feed to dictionary"""
        data = {
            'id': self.id,
            'title': self.title,
            'url': self.url,
            'description': self.description,
            'website_url': self.website_url,
            'language': self.language,
            'category': self.category,
            'tags': self.tags or [],
            'icon_url': self.icon_url,
            'image_url': self.image_url,
            'status': self.status,
            'is_active': self.is_active,
            'auto_update': self.auto_update,
            'update_frequency': self.update_frequency,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None,
            'last_checked': self.last_checked.isoformat() if self.last_checked else None,
            'last_error': self.last_error,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_stats:
            data.update({
                'total_articles': self.total_articles,
                'avg_articles_per_day': self.avg_articles_per_day,
                'error_count': self.error_count,
                'health': self.get_health_status()
            })
        
        return data
    
    def get_health_status(self):
        """Get feed health status based on errors and last update"""
        if self.error_count >= 5:
            return 'error'
        elif self.error_count >= 2:
            return 'warning'
        elif self.last_updated and (datetime.utcnow() - self.last_updated).days > 7:
            return 'warning'
        else:
            return 'good'
    
    def update_stats(self):
        """Update feed statistics"""
        self.total_articles = self.articles.count()
        
        # Calculate average articles per day
        if self.created_at:
            days_since_creation = (datetime.utcnow() - self.created_at).days
            if days_since_creation > 0:
                self.avg_articles_per_day = self.total_articles / days_since_creation
        
        db.session.commit()
    
    def mark_error(self, error_message):
        """Mark feed as having an error"""
        self.last_error = error_message
        self.error_count += 1
        self.last_checked = datetime.utcnow()
        
        # Disable feed if too many errors
        if self.error_count >= 10:
            self.status = 'error'
            self.is_active = False
        
        db.session.commit()
    
    def mark_success(self):
        """Mark feed as successfully updated"""
        self.last_updated = datetime.utcnow()
        self.last_checked = datetime.utcnow()
        self.last_error = None
        self.error_count = 0
        self.status = 'active'
        db.session.commit()
    
    def get_recent_articles(self, limit=10):
        """Get recent articles from this feed"""
        return self.articles.order_by(Article.published_at.desc()).limit(limit).all()
    
    def get_unread_count(self, user_id):
        """Get unread article count for a specific user"""
        from app.models.user_article import UserArticle
        return db.session.query(Article).join(UserArticle).filter(
            Article.feed_id == self.id,
            UserArticle.user_id == user_id,
            UserArticle.is_read == False
        ).count()
    
    @staticmethod
    def get_by_user(user_id, status=None):
        """Get feeds by user with optional status filter"""
        query = Feed.query.filter_by(user_id=user_id)
        if status:
            query = query.filter_by(status=status)
        return query.order_by(Feed.title).all()
    
    @staticmethod
    def get_active_feeds():
        """Get all active feeds for updating"""
        return Feed.query.filter_by(is_active=True, auto_update=True).all()