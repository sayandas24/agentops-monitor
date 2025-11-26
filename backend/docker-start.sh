#!/bin/bash
# Docker Quick Start Script for AgentOps Backend
# This script helps you quickly build and run your containerized backend

set -e  # Exit on error

echo "🐳 AgentOps Backend Docker Setup"
echo "================================="
echo ""

# Check if .env file exists (in current or parent directory)
ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ] && [ -f "../.env" ]; then
    ENV_FILE="../.env"
fi

if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  .env file not found!"
    echo "Creating .env in current directory..."
    
    # Check if .env.example exists in parent directory
    if [ -f "../.env.example" ]; then
        cp ../.env.example .env
        echo "✅ .env file created from ../.env.example"
    else
        echo "❌ .env.example not found. Please create .env manually."
    fi
    
    echo ""
    echo "You need to set:"
    echo "  - DATABASE_URL (from Supabase dashboard)"
    echo "  - SECRET_KEY (generate with: openssl rand -hex 32)"
    echo "  - GEMINI_API_KEY (from Google AI Studio)"
    echo ""
    read -p "Press Enter after updating .env file..."
fi

echo ""
echo "Select an option:"
echo "1) Build and run (development)"
echo "2) Build and run (production)"
echo "3) Stop all containers"
echo "4) View logs"
echo "5) Rebuild from scratch"
echo "6) Run tests"
echo "7) Exit"
echo ""
read -p "Enter your choice [1-7]: " choice

case $choice in
    1)
        echo "🚀 Building and starting development environment..."
        docker-compose up --build
        ;;
    2)
        echo "🚀 Building and starting production environment..."
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
        echo "✅ Production services started!"
        echo "📊 View logs with: docker-compose logs -f backend"
        ;;
    3)
        echo "🛑 Stopping all containers..."
        docker-compose down
        echo "✅ All containers stopped!"
        ;;
    4)
        echo "📊 Showing logs (Ctrl+C to exit)..."
        docker-compose logs -f backend
        ;;
    5)
        echo "🔨 Rebuilding from scratch..."
        docker-compose down -v
        docker-compose build --no-cache
        docker-compose up -d
        echo "✅ Rebuilt and started!"
        ;;
    6)
        echo "🧪 Running tests..."
        docker-compose exec backend pytest
        ;;
    7)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid option!"
        exit 1
        ;;
esac
