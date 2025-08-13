# 📤 Manual VM Transfer Instructions

## 🎯 Quick Start Options

### **Option 1: Using Git (Recommended)**

If your code is on GitHub:

```bash
# On your VM
git clone https://github.com/ClementSeux/ludora-back.git
cd ludora-back
chmod +x deploy-vm.sh
./deploy-vm.sh
```

### **Option 2: Using SCP (SSH File Transfer)**

From your Windows machine:

```powershell
# Transfer entire project
scp -r C:\Projets\ludora-back username@vm-ip:/home/username/

# Or if using SSH key
scp -i path\to\key.pem -r C:\Projets\ludora-back username@vm-ip:/home/username/
```

### **Option 3: Using WinSCP (GUI)**

1. Download WinSCP
2. Connect to your VM
3. Drag and drop the `ludora-back` folder
4. SSH to VM and run deployment script

### **Option 4: Manual File Copy**

If you have direct VM access (not remote):

1. Copy project folder to USB/shared drive
2. Transfer to VM
3. Run deployment script

## 🚀 After Transfer - Run Deployment

Once files are on your VM:

```bash
cd ludora-back
chmod +x deploy-vm.sh
./deploy-vm.sh
```

## 🔧 Manual Deployment Steps

If the script doesn't work, follow these manual steps:

### 1. **Install Node.js**

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. **Install PostgreSQL**

```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3. **Create Database**

```bash
sudo -u postgres psql
```

```sql
CREATE USER ludora_user WITH PASSWORD 'your_password';
CREATE DATABASE ludora_db OWNER ludora_user;
GRANT ALL PRIVILEGES ON DATABASE ludora_db TO ludora_user;
ALTER USER ludora_user CREATEDB;
\q
```

### 4. **Setup Project**

```bash
cd ludora-back
npm install
cp .env.example .env
nano .env  # Edit with your database credentials
```

### 5. **Setup Database**

```bash
npx prisma generate
npx prisma migrate deploy
npm run db:seed
```

### 6. **Start Application**

```bash
# Development
npm run dev

# Production with PM2
sudo npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## 🌐 Access Your API

After deployment:

-   **API**: `http://your-vm-ip:3000`
-   **Health Check**: `http://your-vm-ip:3000/health`
-   **Swagger Docs**: `http://your-vm-ip:3000/api-docs`

## 🆘 Troubleshooting

### **Can't connect to VM?**

-   Check VM IP address
-   Verify SSH is enabled on VM
-   Check firewall settings

### **Permission denied?**

```bash
chmod +x deploy-vm.sh
sudo chown -R $USER:$USER ludora-back
```

### **Database connection issues?**

```bash
sudo systemctl status postgresql
sudo systemctl restart postgresql
```

### **Port 3000 already in use?**

```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

## 📞 Need Help?

1. Check the logs: `pm2 logs` or `npm run dev`
2. Test database: `psql -U ludora_user -d ludora_db -h localhost`
3. Test API: `curl http://localhost:3000/health`

Your VM deployment should be successful! 🎉
