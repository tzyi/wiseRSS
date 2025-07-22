from datetime import datetime
from app import db

class Feed(db.Model):
    __tablename__ = 'feeds'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Feed information
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    url = db.Column(db.String(500), nullable=False)  # RSS feed URL
    site_url = db.Column(db.String(500))  # Website URL
    
    # Feed metadata
    category = db.Column(db.String(100))
    tags = db.Column(db.Text)  # JSON string of tags
    language = db.Column(db.String(10), default='zh-TW')
    
    # Feed status and settings
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    auto_update = db.Column(db.Boolean, default=True, nullable=False)
    update_interval = db.Column(db.Integer, default=3600)  # seconds
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_fetched = db.Column(db.DateTime)
    last_modified = db.Column(db.String(100))  # HTTP Last-Modified header
    etag = db.Column(db.String(100))  # HTTP ETag header
    
    # Feed statistics
    total_articles = db.Column(db.Integer, default=0)
    fetch_errors = db.Column(db.Integer, default=0)
    last_error = db.Column(db.Text)
    
    # Feed image/icon
    image_url = db.Column(db.String(500))
    favicon_url = db.Column(db.String(500))
    
    # Relationships
    articles = db.relationship('Article', backref='feed', lazy='dynamic', cascade='all, delete-orphan')
    
    def __init__(self, user_id, title, url, **kwargs):
        self.user_id = user_id
        self.title = title
        self.url = url
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
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
    
    def update_stats(self):
        """Update feed statistics"""
        self.total_articles = self.articles.count()
        db.session.commit()
    
    def mark_fetch_success(self):
        """Mark successful fetch"""
        self.last_fetched = datetime.utcnow()
        self.fetch_errors = 0
        self.last_error = None
        db.session.commit()
    
    def mark_fetch_error(self, error_message):
        """Mark fetch error"""
        self.fetch_errors += 1
        self.last_error = str(error_message)
        self.last_fetched = datetime.utcnow()
        db.session.commit()
    
    def get_status(self):
        """Get feed status"""
        if not self.is_active:
            return 'inactive'
        elif self.fetch_errors > 5:
            return 'error'
        elif not self.last_fetched:
            return 'pending'
        else:
            return 'active'
    
    def to_dict(self, include_articles=False):
        """Convert feed to dictionary"""
        result = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'url': self.url,
            'site_url': self.site_url,
            'category': self.category,
            'tags': self.get_tags(),
            'language': self.language,
            'is_active': self.is_active,
            'auto_update': self.auto_update,
            'update_interval': self.update_interval,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'last_fetched': self.last_fetched.isoformat() if self.last_fetched else None,
            'total_articles': self.total_articles,
            'fetch_errors': self.fetch_errors,
            'last_error': self.last_error,
            'image_url': self.image_url,
            'favicon_url': self.favicon_url,
            'status': self.get_status()
        }
        
        if include_articles:
            result['articles'] = [article.to_dict() for article in self.articles]
        
        return result
    
    def __repr__(self):
        return f'<Feed {self.title}>'