# DevMind - AI-Powered Knowledge Base for Developers

DevMind is a next-generation notes and knowledge base application specifically designed for developers. It combines advanced AI capabilities with robust organizational tools to enhance productivity and streamline knowledge management.

## 🚀 Features

### ✅ Implemented (MVP)
- **Rich Note Editor**: Advanced text editor with markdown support, syntax highlighting, and rich formatting
- **Smart Organization**: Tag-based categorization, pinning, and archiving
- **Intelligent Search**: Full-text search across notes with filtering capabilities
- **Timeline View**: Track project milestones and progress over time
- **Mind Mapping**: Interactive visual organization of ideas and concepts
- **Modern UI**: Beautiful, responsive interface built with Tailwind CSS
- **Real-time Sync**: Fast API with PostgreSQL backend

### 🔮 Planned Features
- **AI Integration**: Smart code suggestions and contextual reminders
- **Multimedia Support**: Images, videos, and file attachments
- **Collaboration**: Share notes and collaborate with team members
- **Code Snippets**: Syntax-highlighted code blocks with language detection
- **Export Options**: PDF, Markdown, and HTML export
- **Mobile App**: Native mobile applications

## 🏗️ Architecture

### Frontend (`devmind-frontend/`)
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom components
- **Editor**: TipTap rich text editor with extensions
- **Database**: Drizzle ORM with PostgreSQL
- **State Management**: React hooks and context

### Backend (`devmind-backend/`)
- **Language**: Go 1.21.6
- **Framework**: Gorilla Mux for routing
- **Database**: PostgreSQL with GORM
- **API**: RESTful API with CORS support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/bun
- Go 1.21+
- PostgreSQL (or Docker)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd devmind
```

### 2. Set Up the Database
```bash
# Using Docker (recommended)
cd devmind-frontend
./start-database.sh

# Or set up PostgreSQL manually and create a database named 'devmind'
```

### 3. Set Up the Backend
```bash
cd devmind-backend

# Copy environment file and configure
cp .env.example .env
# Edit .env with your database connection details

# Install dependencies
go mod tidy

# Run the backend server
go run main.go
```

### 4. Set Up the Frontend
```bash
cd devmind-frontend

# Copy environment file and configure
cp .env.example .env.local
# Edit .env.local with your database and API URLs

# Install dependencies
npm install
# or
bun install

# Run database migrations
npm run db:push

# Start the development server
npm run dev
# or
bun dev
```

### 5. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api

## 📊 Database Schema

The application uses a PostgreSQL database with the following main tables:

- **notes**: Store note content, metadata, and organization
- **tags**: Manage tag system with colors
- **timelines**: Project timelines and milestones
- **mind_maps**: Mind map data and connections

## 🔧 Development

### Available Scripts

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push database schema
npm run db:studio    # Open Drizzle Studio
```

#### Backend
```bash
go run main.go       # Start development server
go build             # Build binary
go test              # Run tests
```

### API Endpoints

#### Notes
- `GET /api/notes` - Get all notes (with search/filter)
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

#### Tags
- `GET /api/tags` - Get all tags
- `POST /api/tags` - Create new tag

#### Timelines
- `GET /api/timelines` - Get all timelines
- `POST /api/timelines` - Create new timeline
- `PUT /api/timelines/:id` - Update timeline

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Mode**: Automatic theme detection (planned)
- **Keyboard Shortcuts**: Efficient navigation and editing
- **Drag & Drop**: Intuitive mind map interaction
- **Real-time Updates**: Instant saving and synchronization

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your repository to Vercel
2. Set environment variables
3. Deploy automatically on push

### Backend (Railway/Heroku)
1. Create a new app
2. Connect to your repository
3. Set environment variables
4. Deploy the Go application

### Database (Railway/Neon)
1. Create a PostgreSQL database
2. Update connection strings
3. Run migrations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with the T3 Stack (Next.js, TypeScript, Tailwind CSS)
- TipTap for the rich text editor
- Lucide React for icons
- Go and Gorilla Mux for the backend API

---

**DevMind** - Your ultimate digital companion for developer productivity and knowledge management.
