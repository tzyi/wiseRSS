from datetime import datetime
from app import db

class UserArticle(db.Model):
    __tablename__ = 'user_articles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    article_id = db.Column(db.Integer, db.ForeignKey('articles.id'), nullable=False)
    
    # Reading status
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    is_bookmarked = db.Column(db.Boolean, default=False, nullable=False)
    reading_status = db.Column(db.String(20), default='unread')  # unread, reading, read, later, archive
    
    # User interaction
    rating = db.Column(db.Integer)  # 1-5 stars
    notes = db.Column(db.Text)
    highlights = db.Column(db.Text)  # JSON string of highlights
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    read_at = db.Column(db.DateTime)
    bookmarked_at = db.Column(db.DateTime)
    
    # Reading progress
    reading_position = db.Column(db.Float, default=0.0)  # 0.0 to 1.0
    reading_time = db.Column(db.Integer, default=0)  # seconds spent reading
    
    # Unique constraint to prevent duplicate entries
    __table_args__ = (db.UniqueConstraint('user_id', 'article_id', name='user_article_unique'),)
    
    def __init__(self, user_id, article_id, **kwargs):
        self.user_id = user_id
        self.article_id = article_id
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    def mark_as_read(self):
        """Mark article as read"""
        self.is_read = True
        self.reading_status = 'read'
        self.read_at = datetime.utcnow()
        db.session.commit()
    
    def mark_as_unread(self):
        """Mark article as unread"""
        self.is_read = False
        self.reading_status = 'unread'
        self.read_at = None
        db.session.commit()
    
    def toggle_bookmark(self):
        """Toggle bookmark status"""
        self.is_bookmarked = not self.is_bookmarked
        self.bookmarked_at = datetime.utcnow() if self.is_bookmarked else None
        db.session.commit()
        return self.is_bookmarked
    
    def set_reading_status(self, status):
        """Set reading status"""
        valid_statuses = ['unread', 'reading', 'read', 'later', 'archive']
        if status in valid_statuses:
            self.reading_status = status
            if status == 'read' and not self.is_read:
                self.is_read = True
                self.read_at = datetime.utcnow()
            elif status == 'unread':
                self.is_read = False
                self.read_at = None
            db.session.commit()
    
    def set_rating(self, rating):
        """Set user rating (1-5)"""
        if isinstance(rating, int) and 1 <= rating <= 5:
            self.rating = rating
            db.session.commit()
    
    def add_note(self, note):
        """Add or update note"""
        self.notes = note
        db.session.commit()
    
    def get_highlights(self):
        """Get highlights as a list"""
        if self.highlights:
            import json
            try:
                return json.loads(self.highlights)
            except:
                return []
        return []
    
    def add_highlight(self, text, start_pos=None, end_pos=None, color='yellow'):
        """Add a highlight"""
        highlights = self.get_highlights()
        highlight = {
            'id': len(highlights) + 1,
            'text': text,
            'start_pos': start_pos,
            'end_pos': end_pos,
            'color': color,
            'created_at': datetime.utcnow().isoformat()
        }
        highlights.append(highlight)
        
        import json
        self.highlights = json.dumps(highlights)
        db.session.commit()
        return highlight
    
    def remove_highlight(self, highlight_id):
        """Remove a highlight by ID"""
        highlights = self.get_highlights()
        highlights = [h for h in highlights if h.get('id') != highlight_id]
        
        import json
        self.highlights = json.dumps(highlights) if highlights else None
        db.session.commit()
    
    def update_reading_progress(self, position, time_spent=0):
        """Update reading progress"""
        self.reading_position = max(0.0, min(1.0, position))  # Clamp between 0 and 1
        self.reading_time += time_spent
        
        # Auto-mark as read if fully read
        if self.reading_position >= 0.95 and not self.is_read:
            self.mark_as_read()
        
        db.session.commit()
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'article_id': self.article_id,
            'is_read': self.is_read,
            'is_bookmarked': self.is_bookmarked,
            'reading_status': self.reading_status,
            'rating': self.rating,
            'notes': self.notes,
            'highlights': self.get_highlights(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'read_at': self.read_at.isoformat() if self.read_at else None,
            'bookmarked_at': self.bookmarked_at.isoformat() if self.bookmarked_at else None,
            'reading_position': self.reading_position,
            'reading_time': self.reading_time
        }
    
    @classmethod
    def get_or_create(cls, user_id, article_id):
        """Get existing UserArticle or create new one"""
        user_article = cls.query.filter_by(user_id=user_id, article_id=article_id).first()
        if not user_article:
            user_article = cls(user_id=user_id, article_id=article_id)
            db.session.add(user_article)
            db.session.commit()
        return user_article
    
    def __repr__(self):
        return f'<UserArticle user={self.user_id} article={self.article_id}>'