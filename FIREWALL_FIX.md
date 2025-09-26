# 🔥 Firewall & Network Access Troubleshooting

## 🚨 **Your Issue: "La politique de filtrage de votre firewall ne vous permet pas d'accéder à cette adresse IP"**

This error means the firewall is blocking access to your VM at `172.233.255.18:3000`.

## 🔧 **Solutions to Try (in order)**

### **1. Configure VM Firewall (UFW)**

On your VM, run these commands:

```bash
# Check current firewall status
sudo ufw status

# Allow port 3000 from anywhere
sudo ufw allow 3000

# Alternative: Allow only HTTP/HTTPS ports and use reverse proxy
sudo ufw allow 80
sudo ufw allow 443

# Check if rules were added
sudo ufw status numbered

# If firewall is inactive, enable it
sudo ufw enable
```

### **2. Check if Application is Running**

```bash
# Check if your app is running
pm2 status

# Check if port 3000 is listening
sudo netstat -tlnp | grep :3000

# Test locally on the VM
curl http://localhost:3000/health
curl http://127.0.0.1:3000/api-docs
```

### **3. Cloud Provider Firewall Rules**

Your VM appears to be on a cloud provider. You need to configure their firewall too:

#### **If using Linode/Akamai Cloud:**
```bash
# Check if Linode firewall is enabled
# Go to Linode Cloud Manager > Networking > Firewalls
# Add inbound rule: HTTP (port 80), HTTPS (port 443), Custom (port 3000)
```

#### **If using AWS:**
- Go to EC2 > Security Groups
- Edit inbound rules
- Add: Type: Custom TCP, Port: 3000, Source: 0.0.0.0/0

#### **If using Google Cloud:**
```bash
gcloud compute firewall-rules create allow-ludora-api \
    --allow tcp:3000 \
    --source-ranges 0.0.0.0/0
```

#### **If using Azure:**
- Go to Network Security Groups
- Add inbound rule: Port 3000, Source: Any

### **4. Use Nginx Reverse Proxy (Recommended)**

Instead of exposing port 3000 directly, use Nginx on port 80:

```bash
# Install Nginx
sudo apt install nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/ludora-api
```

**Add this configuration:**
```nginx
server {
    listen 80;
    server_name 172.233.255.18;

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

**Enable the configuration:**
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/ludora-api /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Ensure Nginx starts on boot
sudo systemctl enable nginx
```

**Now access your API at:**
- `http://172.233.255.18/health`
- `http://172.233.255.18/api-docs`

### **5. Quick Diagnostic Commands**

Run these on your VM to diagnose:

```bash
# Check what's listening on ports
sudo ss -tlnp

# Check firewall rules
sudo ufw status verbose

# Check Nginx status (if using)
sudo systemctl status nginx

# Check PM2 processes
pm2 status

# Test internal connectivity
curl -v http://localhost:3000/health

# Check system logs
journalctl -u nginx -f
pm2 logs ludora-api
```

## 🎯 **Quick Fix Commands**

Run these commands on your VM right now:

```bash
# 1. Allow port 3000 through firewall
sudo ufw allow 3000

# 2. Check if app is running
pm2 status

# 3. Restart your application
pm2 restart ludora-api

# 4. Test locally
curl http://localhost:3000/health
```

## 🌐 **Expected Results**

After fixing the firewall, you should be able to access:

- **API**: `http://172.233.255.18:3000` (if port 3000 is open)
- **With Nginx**: `http://172.233.255.18` (port 80)
- **Health Check**: `http://172.233.255.18/health`
- **Swagger Docs**: `http://172.233.255.18/api-docs`

## 🆘 **Still Not Working?**

1. **Check cloud provider dashboard** for firewall/security group settings
2. **Contact your hosting provider** about firewall policies
3. **Try using a different port** (like 8080): edit your .env file
4. **Use SSH tunneling** as a temporary solution:
   ```bash
   ssh -L 3000:localhost:3000 username@172.233.255.18
   # Then access http://localhost:3000 on your local machine
   ```

## 📞 **Most Likely Solution**

Based on your IP (172.233.255.18), this looks like a Linode server. You need to:

1. **Configure Linode Cloud Firewall** in their dashboard
2. **Or use Nginx on port 80** (which is usually open by default)

Try the Nginx reverse proxy solution - it's the most reliable approach! 🚀
