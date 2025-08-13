# 🚀 Ludora API - VM Deployment Guide

## 📋 Prerequisites on VM

### 1. **System Requirements**

-   Ubuntu/Debian/CentOS Linux VM
-   Root or sudo access
-   Internet connection

### 2. **Required Software**

-   Node.js (v18 or higher)
-   PostgreSQL (v12 or higher)
-   Git
-   PM2 (for production process management)

## 🔧 Step-by-Step Deployment

### **Step 1: Connect to your VM**

```bash
# SSH to your VM (replace with your VM details)
ssh username@your-vm-ip
# or if using key authentication
ssh -i /path/to/your/key.pem username@your-vm-ip
```

### **Step 2: Install Node.js**

```bash
# Update package manager
sudo apt update

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### **Step 3: Install PostgreSQL**

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
```

**In PostgreSQL shell:**

```sql
CREATE USER ludora_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE ludora_db OWNER ludora_user;
GRANT ALL PRIVILEGES ON DATABASE ludora_db TO ludora_user;
ALTER USER ludora_user CREATEDB;
\q
```

### **Step 4: Clone/Transfer Project**

#### **Option A: Using Git (Recommended)**

```bash
# Clone from your repository
git clone https://github.com/ClementSeux/ludora-back.git
cd ludora-back
```

#### **Option B: Transfer files via SCP**

```bash
# From your local machine (Windows)
scp -r C:\Projets\ludora-back username@your-vm-ip:/home/username/
```

### **Step 5: Setup Project on VM**

```bash
# Navigate to project directory
cd ludora-back

# Install dependencies
npm install

# Install PM2 globally for production
sudo npm install -g pm2

# Create production environment file
cp .env.example .env
nano .env
```

### **Step 6: Configure Environment**

Edit `.env` file:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://ludora_user:your_secure_password@localhost:5432/ludora_db"
JWT_SECRET="your_very_secure_jwt_secret_here_minimum_32_characters"
```

### **Step 7: Setup Database**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database
npm run db:seed
```

### **Step 8: Start Application**

#### **Development Mode**

```bash
npm run dev
```

#### **Production Mode with PM2**

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs

# Restart application
pm2 restart ludora-api

# Save PM2 configuration
pm2 save
pm2 startup
```

## 🌐 Network Configuration

### **Firewall Setup**

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000

# Enable firewall
sudo ufw enable
```

### **Nginx Reverse Proxy (Optional)**

```bash
# Install Nginx
sudo apt install nginx

# Create configuration
sudo nano /etc/nginx/sites-available/ludora-api
```

**Nginx configuration:**

```nginx
server {
    listen 80;
    server_name your-domain.com your-vm-ip;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/ludora-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 📊 Monitoring & Maintenance

### **Check Application Status**

```bash
# PM2 status
pm2 status

# Application logs
pm2 logs ludora-api

# System resources
htop
df -h
```

### **Database Backup**

```bash
# Create backup script
nano backup-db.sh
```

**Backup script:**

```bash
#!/bin/bash
BACKUP_DIR="/home/username/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -h localhost -U ludora_user ludora_db > $BACKUP_DIR/ludora_backup_$DATE.sql
echo "Backup created: $BACKUP_DIR/ludora_backup_$DATE.sql"
```

```bash
chmod +x backup-db.sh
# Run backup
./backup-db.sh
```

## 🔐 Security Checklist

-   [ ] Change default PostgreSQL passwords
-   [ ] Use strong JWT secret
-   [ ] Enable firewall
-   [ ] Set up SSL certificate (Let's Encrypt)
-   [ ] Regular security updates
-   [ ] Monitor logs for suspicious activity

## 🌍 Access Points After Deployment

-   **API**: `http://your-vm-ip:3000`
-   **Health Check**: `http://your-vm-ip:3000/health`
-   **Swagger Documentation**: `http://your-vm-ip:3000/api-docs`

## 🆘 Troubleshooting

### **Common Issues**

1. **Port already in use**

    ```bash
    sudo lsof -i :3000
    sudo kill -9 PID
    ```

2. **PostgreSQL connection failed**

    ```bash
    sudo systemctl status postgresql
    sudo systemctl restart postgresql
    ```

3. **PM2 process not starting**

    ```bash
    pm2 delete all
    pm2 start ecosystem.config.js
    ```

4. **Check application logs**
    ```bash
    pm2 logs ludora-api --lines 100
    ```

## 📞 Support

If you encounter issues:

1. Check the logs: `pm2 logs`
2. Verify database connection: `npm run db:seed`
3. Test API: `curl http://localhost:3000/health`

Your Ludora API should now be running on your VM! 🎉
