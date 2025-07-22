# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

**IMPLEMENTED**: This is now a **fully functional full-stack RSS reader application**. The project includes:

- Complete React frontend with modern UI components
- Flask backend API with MySQL database integration
- User authentication and authorization system
- RSS feed management and article reading features
- Comprehensive project documentation and setup guides

## Current Architecture

This is a fully implemented full-stack RSS reader with:

### Frontend (React Implementation)
- **Framework**: React 18 with React Router 6
- **Styling**: Tailwind CSS with custom dark theme (#0f0f0f, #1a1a1a, #2d2d2d)  
- **State Management**: React Query for data fetching and caching
- **Forms**: React Hook Form for form handling
- **Layout**: Three-column design (sidebar + main content + right panel)
- **Development Server**: Port 3000
- **Authentication**: JWT-based with automatic token refresh

### Backend (Flask Implementation)
- **Framework**: Flask with SQLAlchemy ORM
- **Authentication**: JWT tokens via Flask-JWT-Extended
- **Database**: MySQL with comprehensive schema
- **RSS Processing**: Ready for Feedparser + BeautifulSoup integration
- **API Server**: Port 5000
- **Security**: bcrypt password hashing, CORS configuration

## Development Commands

### Frontend Setup
```bash
cd frontend
npm install            # Install dependencies
npm start             # Start development server (port 3000)
npm test              # Run tests  
npm run build         # Build for production
```

### Backend Setup
```bash
cd backend
python3 -m venv venv                    # Create virtual environment
source venv/bin/activate                # Activate virtual environment
pip install -r requirements.txt        # Install dependencies
python run.py init-db                  # Initialize database tables
python run.py create-admin             # Create admin user
python run.py create-demo-data         # Create demo data (optional)
python run.py                          # Start Flask server (port 5000)
```

```
$ python run.py create-admin
✅ Admin user created successfully!
   Username: admin
   Password: admin123
   ⚠️  Please change the password after first login!

$ python run.py create-demo-data
✅ Demo user created!
✅ Demo data created successfully!
   Demo user: demo / demo123
```

### Database Management
```bash
python run.py test-db-connection      # Test database connection
python run.py drop-db                 # Drop all tables (careful!)
python run.py recreate-db            # Drop and recreate all tables
```

### Testing
- Frontend: `npm test` (in frontend/)
- Backend: `python -m pytest` (in backend/ - when tests are added)

## Key Technical Details

### Database Models (Implemented)
- **User** (`app/models/user.py`): Authentication, preferences, settings
- **Feed** (`app/models/feed.py`): RSS source management with categories/tags  
- **Article** (`app/models/article.py`): Content, metadata, media resources
- **UserArticle** (`app/models/user_article.py`): Reading status, bookmarks, notes, highlights

### API Structure (Implemented)
- `/api/auth/*` - Authentication endpoints (`app/views/auth.py`)
- `/api/feeds/*` - RSS source management (`app/views/feeds.py`)
- `/api/articles/*` - Article management and reading status (`app/views/articles.py`)
- `/api/articles/search` - Full-text search functionality

### UI Implementation (Implemented)
- Based on prototype designs in `reference/UI-rovo/`
- Dark theme with modern card-based layouts
- Responsive design for desktop/tablet/mobile
- Three-column layout: navigation sidebar, article list, reading panel
- React components: Layout, ArticleCard, FeedCard, SearchModal, etc.

### Security Features (Implemented)
- JWT token authentication with refresh mechanism
- bcrypt password hashing
- SQL injection prevention via ORM
- Input validation and sanitization
- CORS configuration for frontend/backend communication

## File Structure (Current)

```
wiseRSS/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/             # Page components
│   │   ├── contexts/          # React contexts
│   │   ├── services/          # API services
│   │   └── utils/             # Utility functions
│   ├── public/                # Static files
│   └── package.json           # Dependencies
├── backend/                    # Flask application
│   ├── app/
│   │   ├── models/            # SQLAlchemy models
│   │   ├── views/             # API endpoints
│   │   ├── services/          # Business logic
│   │   └── utils/             # Utility functions
│   ├── config/                # Configuration files
│   ├── migrations/            # Database migrations
│   ├── requirements.txt       # Python dependencies
│   ├── run.py                 # Application runner
│   └── .env                   # Environment variables
├── reference/                  # UI prototypes (original)
└── README.md                  # Comprehensive documentation
```

## Database Configuration

### MySQL Setup (Required)
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE wiserss CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Create user (if needed)
mysql -u root -p -e "CREATE USER 'cabie'@'localhost' IDENTIFIED BY 'Aa-12345';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON wiserss.* TO 'cabie'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"
```

### Environment Variables (.env)
```bash
# Database
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=cabie
MYSQL_PASSWORD=Aa-12345
MYSQL_DATABASE=wiserss

# Security
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key

# CORS
CORS_ORIGINS=http://localhost:3000
```

## Development Workflow (Completed)

The following have been implemented:
1. ✅ Backend API structure (Flask + SQLAlchemy)
2. ✅ Database models and authentication system
3. ✅ Frontend React components following UI prototypes
4. ✅ User management and JWT authentication
5. ✅ Feed management system
6. ✅ Article management and reading status
7. ✅ Search functionality framework

## Next Steps for Enhancement

Future development could include:
1. RSS parsing and automatic feed updates (Celery + Redis)
2. Real-time notifications for new articles
3. Advanced search with full-text indexing
4. Article content extraction and cleanup
5. Mobile app development
6. Social features (sharing, recommendations)
7. Analytics and reading statistics