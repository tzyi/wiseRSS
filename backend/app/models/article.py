from datetime import datetime
from app import db
from sqlalchemy import Text, Index

class Article(db.Model):
    __tablename__ = 'articles'
    
    id = db.Column(db.Integer, primary_key=True)
    feed_id = db.Column(db.Integer, db.ForeignKey('feeds.id'), nullable=False, index=True)
    
    # Article content
    title = db.Column(db.String(500), nullable=False)
    url = db.Column(db.String(1000), nullable=False, unique=True)
    description = db.Column(Text)
    content = db.Column(Text)
    summary = db.Column(Text)
    
    # Metadata
    author = db.Column(db.String(255))
    published_at = db.Column(db.DateTime, index=True)
    updated_at_source = db.Column(db.DateTime)  # When article was last updated at source
    
    # Content analysis
    word_count = db.Column(db.Integer)
    reading_time = db.Column(db.Integer)  # in minutes
    language = db.Column(db.String(10))
    
    # Media
    image_url = db.Column(db.String(1000))
    video_url = db.Column(db.String(1000))
    
    # Categories and tags
    categories = db.Column(db.JSON)  # Store as JSON array
    tags = db.Column(db.JSON)  # Store as JSON array
    
    # Article identifiers (for deduplication)
    guid = db.Column(db.String(500), index=True)  # RSS GUID
    content_hash = db.Column(db.String(64), index=True)  # Hash of content for deduplication
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user_articles = db.relationship('UserArticle', backref='article', lazy='dynamic', cascade='all, delete-orphan')
    
    # Indexes for better performance
    __table_args__ = (
        Index('idx_feed_published', 'feed_id', 'published_at'),
        Index('idx_published_created', 'published_at', 'created_at'),
    )
    
    def __repr__(self):
        return f'<Article {self.title[:50]}>'
    
    def to_dict(self, user_id=None):
        """Convert article to dictionary"""
        data = {
            'id': self.id,
            'feed_id': self.feed_id,
            'title': self.title,
            'url': self.url,
            'description': self.description,
            'content': self.content,
            'summary': self.summary,
            'author': self.author,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'updated_at_source': self.updated_at_source.isoformat() if self.updated_at_source else None,
            'word_count': self.word_count,
            'reading_time': self.reading_time,
            'language': self.language,
            'image_url': self.image_url,
            'video_url': self.video_url,
            'categories': self.categories or [],
            'tags': self.tags or [],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        # Add user-specific data if user_id provided
        if user_id:
            user_article = self.get_user_article(user_id)
            if user_article:
                data.update({
                    'is_read': user_article.is_read,
                    'is_favorite': user_article.is_favorite,
                    'read_progress': user_article.read_progress,
                    'read_at': user_article.read_at.isoformat() if user_article.read_at else None,
                    'notes': user_article.notes,
                    'highlights': user_article.highlights or []
                })
            else:
                data.update({
                    'is_read': False,
                    'is_favorite': False,
                    'read_progress': 0,
                    'read_at': None,
                    'notes': None,
                    'highlights': []
                })
        
        # Add feed information
        if self.feed:
            data.update({
                'feed_title': self.feed.title,
                'feed_url': self.feed.url,
                'source': self.feed.title
            })
        
        return data
    
    def get_user_article(self, user_id):
        """Get UserArticle record for specific user"""
        from app.models.user_article import UserArticle
        return UserArticle.query.filter_by(
            user_id=user_id,
            article_id=self.id
        ).first()
    
    def mark_as_read(self, user_id):
        """Mark article as read for user"""
        from app.models.user_article import UserArticle
        user_article = self.get_user_article(user_id)
        if not user_article:
            user_article = UserArticle(
                user_id=user_id,
                article_id=self.id,
                is_read=True,
                read_at=datetime.utcnow()
            )
            db.session.add(user_article)
        else:
            user_article.is_read = True
            user_article.read_at = datetime.utcnow()
        
        db.session.commit()
        return user_article
    
    def mark_as_unread(self, user_id):
        """Mark article as unread for user"""
        from app.models.user_article import UserArticle
        user_article = self.get_user_article(user_id)
        if user_article:
            user_article.is_read = False
            user_article.read_at = None
            db.session.commit()
        return user_article
    
    def toggle_favorite(self, user_id):
        """Toggle favorite status for user"""
        from app.models.user_article import UserArticle
        user_article = self.get_user_article(user_id)
        if not user_article:
            user_article = UserArticle(
                user_id=user_id,
                article_id=self.id,
                is_favorite=True
            )
            db.session.add(user_article)
        else:
            user_article.is_favorite = not user_article.is_favorite
        
        db.session.commit()
        return user_article
    
    def calculate_reading_time(self):
        """Calculate estimated reading time based on word count"""
        if self.word_count:
            # Average reading speed: 200 words per minute
            self.reading_time = max(1, round(self.word_count / 200))
        elif self.content:
            # Estimate word count from content
            words = len(self.content.split())
            self.word_count = words
            self.reading_time = max(1, round(words / 200))
        else:
            self.reading_time = 1
    
    @staticmethod
    def get_by_feed(feed_id, limit=None, offset=None):
        """Get articles by feed"""
        query = Article.query.filter_by(feed_id=feed_id).order_by(Article.published_at.desc())
        if limit:
            query = query.limit(limit)
        if offset:
            query = query.offset(offset)
        return query.all()
    
    @staticmethod
    def get_recent(user_id, limit=25, offset=0, filters=None):
        """Get recent articles for user with optional filters"""
        from app.models.user_article import UserArticle
        from app.models.feed import Feed
        
        query = db.session.query(Article).join(Feed).filter(Feed.user_id == user_id)
        
        # Apply filters
        if filters:
            if filters.get('feed_id'):
                query = query.filter(Article.feed_id == filters['feed_id'])
            if filters.get('is_read') is not None:
                query = query.outerjoin(UserArticle, 
                    (UserArticle.article_id == Article.id) & 
                    (UserArticle.user_id == user_id)
                ).filter(
                    UserArticle.is_read == filters['is_read'] if filters['is_read'] else 
                    UserArticle.is_read.is_(None) | (UserArticle.is_read == False)
                )
            if filters.get('is_favorite'):
                query = query.join(UserArticle, 
                    (UserArticle.article_id == Article.id) & 
                    (UserArticle.user_id == user_id)
                ).filter(UserArticle.is_favorite == True)
            if filters.get('category'):
                query = query.filter(Article.categories.contains([filters['category']]))
        
        return query.order_by(Article.published_at.desc()).offset(offset).limit(limit).all()
    
    @staticmethod
    def search(user_id, query_text, filters=None):
        """Search articles for user"""
        from app.models.feed import Feed
        
        query = db.session.query(Article).join(Feed).filter(Feed.user_id == user_id)
        
        # Text search
        search_filter = (
            Article.title.contains(query_text) |
            Article.description.contains(query_text) |
            Article.content.contains(query_text) |
            Article.author.contains(query_text)
        )
        query = query.filter(search_filter)
        
        # Apply additional filters
        if filters:
            if filters.get('type') == 'articles':
                pass  # Already filtering articles
            elif filters.get('type') == 'feeds':
                # This would be handled in a separate method
                pass
        
        return query.order_by(Article.published_at.desc()).all()