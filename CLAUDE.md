# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

**IMPORTANT**: This is currently a **specification-only project** with UI prototypes. The README describes a full-stack RSS reader application, but no implementation code exists yet. The actual codebase contains:

- Comprehensive project documentation (README.md)
- UI/UX prototypes in `reference/` directory (HTML/CSS files from Claude and Rovo)
- Git configuration expecting frontend/backend structure

## Planned Architecture

Based on the README specifications, this will be a full-stack RSS reader with:

### Frontend (React-based)
- **Framework**: React 18 with React Router
- **Styling**: Tailwind CSS (deep dark theme: #0f0f0f, #1a1a1a, #2d2d2d)  
- **State Management**: React Query for data fetching/caching
- **Forms**: React Hook Form
- **Layout**: Three-column design (sidebar + main content + right panel)
- **Development Server**: Port 3000

### Backend (Flask-based)
- **Framework**: Flask with SQLAlchemy ORM
- **Authentication**: JWT tokens via Flask-JWT-Extended
- **RSS Processing**: Feedparser + BeautifulSoup
- **Async Tasks**: Celery with Redis
- **Database**: SQLite (default), PostgreSQL/MySQL supported
- **API Server**: Port 5000

## Development Commands (When Implemented)

### Frontend Setup
```bash
cd frontend
npm install
npm start              # Development server
npm test              # Run tests  
npm run build         # Production build
```

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 run.py init-db        # Initialize database
python3 run.py create-admin   # Create admin user
python3 run.py               # Start Flask server
```

### Testing
- Frontend: `npm test` (in frontend/)
- Backend: `python -m pytest` (in backend/)

## Key Technical Details

### Database Models (Planned)
- **User**: Authentication, preferences, settings
- **Feed**: RSS source management with categories/tags
- **Article**: Content, metadata, media resources  
- **UserArticle**: Reading status, bookmarks, notes, highlights

### API Structure (Planned)
- `/api/auth/*` - Authentication endpoints
- `/api/feeds/*` - RSS source management
- `/api/articles/*` - Article management and reading status
- `/api/articles/search` - Full-text search functionality

### UI Implementation Notes
- Follow prototype designs in `reference/UI-rovo/` and `reference/UI-claude/`
- Dark theme with modern card-based layouts
- Responsive design for desktop/tablet/mobile
- Three-column layout: navigation sidebar, article list, reading panel

### Security Features (Planned)
- JWT token authentication with refresh mechanism
- bcrypt password hashing
- SQL injection prevention via ORM
- XSS protection with input validation
- CORS configuration for frontend/backend communication

## File Structure (When Implemented)

The project will follow this structure:
```
wiseRSS/
├── frontend/          # React application
├── backend/           # Flask application  
├── reference/         # UI prototypes (current)
└── README.md         # Project specification
```

## Development Workflow

Since this is a greenfield project:
1. Implement backend API structure first (Flask + SQLAlchemy)
2. Set up database models and authentication
3. Build frontend React components following UI prototypes
4. Integrate RSS parsing and article management
5. Add search functionality and user preferences
6. Implement real-time updates and caching