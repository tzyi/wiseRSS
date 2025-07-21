from datetime import datetime
from app import db

class UserArticle(db.Model):
    __tablename__ = 'user_articles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    article_id = db.Column(db.Integer, db.ForeignKey('articles.id'), nullable=False, index=True)
    
    # Reading status
    is_read = db.Column(db.Boolean, default=False, index=True)
    is_favorite = db.Column(db.Boolean, default=False, index=True)
    read_progress = db.Column(db.Integer, default=0)  # Percentage (0-100)
    
    # User content
    notes = db.Column(db.Text)
    highlights = db.Column(db.JSON)  # Store highlights as JSON array
    rating = db.Column(db.Integer)  # 1-5 star rating
    
    # Timestamps
    read_at = db.Column(db.DateTime)
    favorited_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Unique constraint
    __table_args__ = (
        db.UniqueConstraint('user_id', 'article_id', name='unique_user_article'),
        db.Index('idx_user_read_status', 'user_id', 'is_read'),
        db.Index('idx_user_favorite', 'user_id', 'is_favorite'),
    )
    
    def __repr__(self):
        return f'<UserArticle user_id={self.user_id} article_id={self.article_id}>'
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'article_id': self.article_id,
            'is_read': self.is_read,
            'is_favorite': self.is_favorite,
            'read_progress': self.read_progress,
            'notes': self.notes,
            'highlights': self.highlights or [],
            'rating': self.rating,
            'read_at': self.read_at.isoformat() if self.read_at else None,
            'favorited_at': self.favorited_at.isoformat() if self.favorited_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def mark_as_read(self):
        """Mark as read"""
        self.is_read = True
        self.read_at = datetime.utcnow()
        if self.read_progress < 100:
            self.read_progress = 100
    
    def mark_as_unread(self):
        """Mark as unread"""
        self.is_read = False
        self.read_at = None
        self.read_progress = 0
    
    def add_to_favorites(self):
        """Add to favorites"""
        self.is_favorite = True
        self.favorited_at = datetime.utcnow()
    
    def remove_from_favorites(self):
        """Remove from favorites"""
        self.is_favorite = False
        self.favorited_at = None
    
    def add_highlight(self, text, color='yellow', position=None):
        """Add a highlight"""
        if not self.highlights:
            self.highlights = []
        
        highlight = {
            'id': len(self.highlights) + 1,
            'text': text,
            'color': color,
            'position': position,
            'created_at': datetime.utcnow().isoformat()
        }
        
        self.highlights.append(highlight)
        db.session.commit()
        return highlight
    
    def remove_highlight(self, highlight_id):
        """Remove a highlight"""
        if self.highlights:
            self.highlights = [h for h in self.highlights if h.get('id') != highlight_id]
            db.session.commit()
    
    def update_progress(self, progress):
        """Update reading progress"""
        self.read_progress = max(0, min(100, progress))
        if self.read_progress >= 100 and not self.is_read:
            self.mark_as_read()
    
    @staticmethod
    def get_or_create(user_id, article_id):
        """Get existing UserArticle or create new one"""
        user_article = UserArticle.query.filter_by(
            user_id=user_id,
            article_id=article_id
        ).first()
        
        if not user_article:
            user_article = UserArticle(
                user_id=user_id,
                article_id=article_id
            )
            db.session.add(user_article)
            db.session.commit()
        
        return user_article