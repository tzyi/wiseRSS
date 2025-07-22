from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate
from config.config import config

db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    # JWT configuration
    @jwt.user_identity_loader
    def user_identity_lookup(user):
        return str(user)
    
    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        identity = jwt_data["sub"]
        try:
            user_id = int(identity)
            from app.models.user import User
            return User.query.filter_by(id=user_id).one_or_none()
        except (ValueError, TypeError):
            return None
    
    # Register blueprints
    from app.views.auth import auth_bp
    from app.views.feeds import feeds_bp
    from app.views.articles import articles_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(feeds_bp, url_prefix='/api/feeds')
    app.register_blueprint(articles_bp, url_prefix='/api/articles')
    
    # Health check endpoint
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy', 'message': 'WiseRSS API is running'}
    
    return app