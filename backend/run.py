#!/usr/bin/env python3
import os
from app import create_app, db
from app.models import User, Feed, Article, UserArticle, Category

app = create_app()

@app.shell_context_processor
def make_shell_context():
    return {
        'db': db,
        'User': User,
        'Feed': Feed,
        'Article': Article,
        'UserArticle': UserArticle,
        'Category': Category
    }

@app.cli.command()
def init_db():
    """Initialize the database."""
    db.create_all()
    print('Database initialized.')

@app.cli.command()
def create_admin():
    """Create admin user."""
    username = input('Admin username: ')
    email = input('Admin email: ')
    password = input('Admin password: ')
    
    if User.find_by_username(username):
        print('Username already exists.')
        return
    
    if User.find_by_email(email):
        print('Email already exists.')
        return
    
    admin = User(
        username=username,
        email=email,
        display_name='Administrator',
        is_verified=True
    )
    admin.set_password(password)
    
    db.session.add(admin)
    db.session.commit()
    
    # Create default categories
    Category.create_default_categories(admin.id)
    
    print(f'Admin user {username} created successfully.')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)