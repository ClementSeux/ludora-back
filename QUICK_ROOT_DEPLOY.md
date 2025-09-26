# 🚀 Quick Root Deployment Commands

Since you're running as root on your VM, here are the manual commands to deploy:

## **Step 1: Install Dependencies**

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# Install PM2
npm install -g pm2
```

## **Step 2: Setup Database**

```bash
# Switch to postgres user and create database
sudo -u postgres psql
```

**In PostgreSQL shell:**

```sql
CREATE USER ludora_user WITH PASSWORD 'your_secure_password_here';
CREATE DATABASE ludora_db OWNER ludora_user;
GRANT ALL PRIVILEGES ON DATABASE ludora_db TO ludora_user;
ALTER USER ludora_user CREATEDB;
\q
```

## **Step 3: Configure Project**

```bash
# Navigate to project
cd /home/ludora-back

# Install dependencies
npm install

# Create environment file
cp .env.example .env
nano .env
```

**Edit .env with your database password:**

```env
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://ludora_user:your_secure_password_here@localhost:5432/ludora_db"
JWT_SECRET="your_very_secure_jwt_secret_here_minimum_32_characters_long"
```

## **Step 4: Setup Database Schema**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database
npm run db:seed
```

## **Step 5: Start Application**

```bash
# Create logs directory
mkdir -p logs

# Configure firewall
ufw allow 3000
ufw --force enable

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup | tail -1 | bash

# Check status
pm2 status
```

## **🌐 Access Your API**

Your API should now be running at:

-   **API**: `http://your-vm-ip:3000`
-   **Health Check**: `http://your-vm-ip:3000/health`
-   **Swagger Docs**: `http://your-vm-ip:3000/api-docs`

## **📋 Management Commands**

```bash
# Check logs
pm2 logs ludora-api

# Restart application
pm2 restart ludora-api

# Stop application
pm2 stop ludora-api

# Monitor resources
pm2 monit
```

## **🔧 Test API**

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test with external IP
curl http://$(curl -s ifconfig.me):3000/health
```

Your deployment should be successful! 🎉
