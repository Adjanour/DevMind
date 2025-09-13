#!/bin/bash

echo "🧠 DevMind Setup Script"
echo "======================="

# Check prerequisites
echo "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Go
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed. Please install Go 1.21+ first."
    exit 1
fi

# Check Docker (optional)
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker not found. You'll need to set up PostgreSQL manually."
else
    echo "✅ Docker found. Will use Docker for PostgreSQL."
fi

echo "✅ Prerequisites check completed"
echo ""

# Set up database
echo "🗄️  Setting up database..."
cd devmind-frontend

if command -v docker &> /dev/null; then
    ./start-database.sh
    echo "✅ Database container started"
else
    echo "⚠️  Please set up PostgreSQL manually and create a database named 'devmind'"
    echo "   Connection details should be: postgresql://devmind:devmind123@localhost:5432/devmind"
fi

# Set up environment files
echo "📝 Setting up environment files..."

if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "✅ Created .env.local from example"
else
    echo "⚠️  .env.local already exists"
fi

cd ../devmind-backend

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env from example"
else
    echo "⚠️  .env already exists"
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../devmind-frontend
npm install || bun install
echo "✅ Frontend dependencies installed"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd ../devmind-backend
go mod tidy
echo "✅ Backend dependencies installed"

# Set up database schema
echo "🏗️  Setting up database schema..."
cd ../devmind-frontend
sleep 5  # Wait for database to be ready
npm run db:push
echo "✅ Database schema created"

echo ""
echo "🎉 DevMind setup completed!"
echo ""
echo "To start the application:"
echo "1. Start the backend:"
echo "   cd devmind-backend && go run main.go"
echo ""
echo "2. Start the frontend (in a new terminal):"
echo "   cd devmind-frontend && npm run dev"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Happy coding! 🚀"