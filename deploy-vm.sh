#!/bin/bash

# 🚀 Ludora API - Quick VM Deployment Script
# This script automates the deployment process on a Ubuntu/Debian VM

set -e  # Exit on any error

echo "🚀 Starting Ludora API deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    print_error "Please do not run this script as root"
    exit 1
fi

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js
print_status "Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_success "Node.js installed successfully"
else
    print_success "Node.js already installed: $(node --version)"
fi

# Install PostgreSQL
print_status "Installing PostgreSQL..."
if ! command -v psql &> /dev/null; then
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    print_success "PostgreSQL installed successfully"
else
    print_success "PostgreSQL already installed"
fi

# Install PM2
print_status "Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    print_success "PM2 installed successfully"
else
    print_success "PM2 already installed: $(pm2 --version)"
fi

# Create project directory
PROJECT_DIR="$HOME/ludora-back"
if [ ! -d "$PROJECT_DIR" ]; then
    print_warning "Project directory not found. Please transfer your project files to $PROJECT_DIR"
    mkdir -p "$PROJECT_DIR"
    echo "Created directory: $PROJECT_DIR"
    echo "Please copy your project files and run this script again."
    exit 1
fi

cd "$PROJECT_DIR"

# Install project dependencies
print_status "Installing project dependencies..."
npm install

# Setup environment file
if [ ! -f ".env" ]; then
    print_status "Creating environment file..."
    cat > .env << EOL
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://ludora_user:ludora_password@localhost:5432/ludora_db"
JWT_SECRET="your_very_secure_jwt_secret_here_minimum_32_characters_long"
EOL
    print_warning "Please edit .env file with your actual database credentials!"
    print_warning "Run: nano .env"
fi

# Create logs directory
mkdir -p logs

# Setup database
print_status "Setting up database..."
read -p "Do you want to setup the database now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Creating database user and database..."
    
    # Prompt for database password
    read -s -p "Enter password for ludora_user: " DB_PASSWORD
    echo
    
    sudo -u postgres psql << EOL
CREATE USER ludora_user WITH PASSWORD '$DB_PASSWORD';
CREATE DATABASE ludora_db OWNER ludora_user;
GRANT ALL PRIVILEGES ON DATABASE ludora_db TO ludora_user;
ALTER USER ludora_user CREATEDB;
\q
EOL
    
    # Update .env with actual password
    sed -i "s/ludora_password/$DB_PASSWORD/g" .env
    
    # Run migrations
    print_status "Running database migrations..."
    npx prisma generate
    npx prisma migrate deploy
    
    # Seed database
    print_status "Seeding database..."
    npm run db:seed
    
    print_success "Database setup completed!"
fi

# Setup firewall
print_status "Configuring firewall..."
sudo ufw allow 3000
sudo ufw --force enable

# Start application with PM2
print_status "Starting application with PM2..."
pm2 delete ludora-api 2>/dev/null || true  # Delete if exists
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup | tail -1 | sudo bash

print_success "🎉 Deployment completed successfully!"
echo
echo "📊 Application Status:"
pm2 status

echo
echo "🌐 Your API is now running at:"
echo "   • API: http://$(curl -s ifconfig.me):3000"
echo "   • Health Check: http://$(curl -s ifconfig.me):3000/health"
echo "   • Swagger Docs: http://$(curl -s ifconfig.me):3000/api-docs"
echo
echo "📋 Useful commands:"
echo "   • Check logs: pm2 logs ludora-api"
echo "   • Restart app: pm2 restart ludora-api"
echo "   • Stop app: pm2 stop ludora-api"
echo "   • Monitor: pm2 monit"
echo
print_success "Deployment script finished!"
