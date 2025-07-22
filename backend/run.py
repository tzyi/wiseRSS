#!/usr/bin/env python3
import os
import sys
from flask import Flask
from flask.cli import FlaskGroup
from app import create_app, db
from app.models import User, Feed, Article, UserArticle

def create_cli_app():
    """Create Flask app for CLI commands"""
    app = create_app(os.getenv('FLASK_ENV', 'development'))
    return app

cli = FlaskGroup(create_app=create_cli_app)

@cli.command('init-db')
def init_db():
    """Initialize the database"""
    try:
        db.create_all()
        print("✅ Database initialized successfully!")
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        sys.exit(1)

@cli.command('drop-db')
def drop_db():
    """Drop all database tables"""
    try:
        db.drop_all()
        print("✅ Database tables dropped successfully!")
    except Exception as e:
        print(f"❌ Error dropping database: {e}")
        sys.exit(1)

@cli.command('recreate-db')
def recreate_db():
    """Drop and recreate database tables"""
    try:
        db.drop_all()
        db.create_all()
        print("✅ Database recreated successfully!")
    except Exception as e:
        print(f"❌ Error recreating database: {e}")
        sys.exit(1)

@cli.command('create-admin')
def create_admin():
    """Create admin user"""
    try:
        # Check if admin already exists
        admin = User.query.filter_by(username='admin').first()
        if admin:
            print("⚠️  Admin user already exists!")
            return
        
        # Create admin user
        admin = User(
            username='admin',
            email='admin@wiserss.com',
            password='admin123'
        )
        admin.is_admin = True
        
        db.session.add(admin)
        db.session.commit()
        
        print("✅ Admin user created successfully!")
        print("   Username: admin")
        print("   Password: admin123")
        print("   ⚠️  Please change the password after first login!")
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error creating admin user: {e}")
        sys.exit(1)

@cli.command('create-demo-data')
def create_demo_data():
    """Create demo data for testing"""
    try:
        # Create demo user if not exists
        demo_user = User.query.filter_by(username='demo').first()
        if not demo_user:
            demo_user = User(
                username='demo',
                email='demo@wiserss.com',
                password='demo123'
            )
            db.session.add(demo_user)
            db.session.commit()
            print("✅ Demo user created!")
        
        # Create demo feeds
        demo_feeds = [
            {
                'title': 'TechCrunch',
                'description': '最新的科技新聞、創業資訊和產品評測',
                'url': 'https://techcrunch.com/feed/',
                'site_url': 'https://techcrunch.com',
                'category': '科技',
                'tags': ['科技', '創業']
            },
            {
                'title': 'Harvard Business Review',
                'description': '商業管理、領導力和策略分析的權威資源',
                'url': 'https://hbr.org/feed',
                'site_url': 'https://hbr.org',
                'category': '商業',
                'tags': ['商業', '管理']
            },
            {
                'title': 'Design Weekly',
                'description': '每週精選的設計趨勢、工具和靈感',
                'url': 'https://designweekly.com/rss',
                'site_url': 'https://designweekly.com',
                'category': '設計',
                'tags': ['設計', 'UI/UX']
            }
        ]
        
        for feed_data in demo_feeds:
            existing_feed = Feed.query.filter_by(
                user_id=demo_user.id, 
                title=feed_data['title']
            ).first()
            
            if not existing_feed:
                feed = Feed(
                    user_id=demo_user.id,
                    title=feed_data['title'],
                    description=feed_data['description'],
                    url=feed_data['url'],
                    site_url=feed_data['site_url'],
                    category=feed_data['category']
                )
                feed.set_tags(feed_data['tags'])
                db.session.add(feed)
        
        db.session.commit()
        print("✅ Demo data created successfully!")
        print("   Demo user: demo / demo123")
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error creating demo data: {e}")
        sys.exit(1)

@cli.command('test-db-connection')
def test_db_connection():
    """Test database connection"""
    try:
        # Try to execute a simple query
        result = db.session.execute('SELECT 1').fetchone()
        if result:
            print("✅ Database connection successful!")
        else:
            print("❌ Database connection failed!")
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    # Set default port to 5000 if not specified
    if len(sys.argv) == 1:
        # Start the development server
        app = create_cli_app()
        app.run(host='0.0.0.0', port=5000, debug=True)
    else:
        # Run CLI commands
        cli()