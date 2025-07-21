from datetime import datetime
from app import db

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    # Category information
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    color = db.Column(db.String(7), default='#3b82f6')  # Hex color code
    icon = db.Column(db.String(50))  # FontAwesome icon class
    
    # Settings
    is_active = db.Column(db.Boolean, default=True)
    sort_order = db.Column(db.Integer, default=0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Unique constraint for user categories
    __table_args__ = (
        db.UniqueConstraint('user_id', 'name', name='unique_user_category'),
    )
    
    def __repr__(self):
        return f'<Category {self.name}>'
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'color': self.color,
            'icon': self.icon,
            'is_active': self.is_active,
            'sort_order': self.sort_order,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'feed_count': self.get_feed_count(),
            'article_count': self.get_article_count()
        }
    
    def get_feed_count(self):
        """Get number of feeds in this category"""
        from app.models.feed import Feed
        return Feed.query.filter_by(user_id=self.user_id, category=self.name).count()
    
    def get_article_count(self):
        """Get number of articles in this category"""
        from app.models.feed import Feed
        from app.models.article import Article
        return db.session.query(Article).join(Feed).filter(
            Feed.user_id == self.user_id,
            Feed.category == self.name
        ).count()
    
    @staticmethod
    def get_by_user(user_id):
        """Get all categories for a user"""
        return Category.query.filter_by(user_id=user_id).order_by(Category.sort_order, Category.name).all()
    
    @staticmethod
    def create_default_categories(user_id):
        """Create default categories for new user"""
        default_categories = [
            {'name': '科技', 'color': '#3b82f6', 'icon': 'fas fa-microchip'},
            {'name': '商業', 'color': '#10b981', 'icon': 'fas fa-chart-line'},
            {'name': '設計', 'color': '#ef4444', 'icon': 'fas fa-palette'},
            {'name': '新聞', 'color': '#f59e0b', 'icon': 'fas fa-newspaper'},
            {'name': '娛樂', 'color': '#8b5cf6', 'icon': 'fas fa-film'},
        ]
        
        categories = []
        for i, cat_data in enumerate(default_categories):
            category = Category(
                user_id=user_id,
                name=cat_data['name'],
                color=cat_data['color'],
                icon=cat_data['icon'],
                sort_order=i
            )
            categories.append(category)
            db.session.add(category)
        
        db.session.commit()
        return categories