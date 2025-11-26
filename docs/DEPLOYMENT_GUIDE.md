# Med Tools Hub - Deployment Guide

## 🚀 Production Deployment (Hostinger VPS)

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 12+ database
- SMTP credentials for email service
- Groq API key for AI
- Domain name (medtoolshub.cloud)

### 1. Environment Setup

Create `.env` with production values:

```bash
# Database
DATABASE_URL=postgresql://user:password@db-host:5432/medtoolshub

# Session
SESSION_SECRET=$(openssl rand -hex 32)

# Email (Hostinger SMTP)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=noreply@medtoolshub.cloud
SMTP_PASS=your_password
SMTP_FROM=noreply@medtoolshub.cloud

# AI Services
GROQ_API_KEY=your_groq_api_key

# WebAuthn (CRITICAL)
RP_ID=medtoolshub.cloud
APP_ORIGIN=https://medtoolshub.cloud

# Feature Flags
MAINTENANCE_MODE=false
NODE_ENV=production
```

### 2. Database Setup

```bash
# Connect to PostgreSQL
psql -U postgres -h your-db-host

# Create database
CREATE DATABASE medtoolshub;
CREATE USER medtoolshub_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE medtoolshub TO medtoolshub_user;

# Import schema
psql -U medtoolshub_user -d medtoolshub < schema.sql
```

### 3. Application Setup

```bash
# Clone repository
git clone https://github.com/your-org/medtoolshub.git
cd medtoolshub

# Install dependencies
npm install

# Build (if using TypeScript)
npm run build

# Run migrations (if applicable)
npm run migrate

# Start server
npm start

# Or use PM2 for process management
pm2 start server.js --name "med-tools-hub"
pm2 startup
pm2 save
```

### 4. Nginx Reverse Proxy Configuration

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name medtoolshub.cloud www.medtoolshub.cloud;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name medtoolshub.cloud www.medtoolshub.cloud;
    
    ssl_certificate /etc/letsencrypt/live/medtoolshub.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/medtoolshub.cloud/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Reverse proxy to Node.js
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # WebAuthn needs long timeouts
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }
}
```

### 5. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d medtoolshub.cloud -d www.medtoolshub.cloud

# Auto-renew (runs automatically on most systems)
sudo systemctl enable certbot.timer
```

### 6. Monitoring & Logging

```bash
# View server logs
pm2 logs med-tools-hub

# Monitor system
pm2 monit

# Set up log rotation
# Create /etc/logrotate.d/med-tools-hub
```

### 7. Backup Strategy

```bash
# Database backups (daily)
0 2 * * * pg_dump -U medtoolshub_user medtoolshub | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz

# Application backups
0 3 * * * tar -czf /backups/app_$(date +\%Y\%m\%d).tar.gz /home/med-tools-hub/

# Cleanup old backups (keep 30 days)
0 4 * * * find /backups -name "*.gz" -mtime +30 -delete
```

### 8. Performance Optimization

```bash
# Node.js clustering (in server.js)
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  app.listen(5000);
}
```

### 9. Security Checklist

- [ ] HTTPS/SSL configured
- [ ] Strong SESSION_SECRET (32+ random characters)
- [ ] GROQ_API_KEY secured
- [ ] Database user has minimal privileges
- [ ] Firewall rules configured
- [ ] WebAuthn RP_ID matches domain exactly
- [ ] Email SMTP credentials secured
- [ ] Regular security updates applied
- [ ] Backup tested and restored
- [ ] Rate limiting configured

### 10. Health Check Endpoint

```bash
# Add to server.js
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

# Monitor with curl
curl https://medtoolshub.cloud/health
```

## 🔄 Deployment Process

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm install

# 3. Run migrations
npm run migrate

# 4. Restart application
pm2 restart med-tools-hub

# 5. Verify health
curl https://medtoolshub.cloud/health

# 6. Check logs
pm2 logs med-tools-hub --lines 50
```

## 📊 Monitoring Commands

```bash
# CPU/Memory usage
pm2 monit

# Application logs
pm2 logs

# Restart if crashed
pm2 restart all --watch

# Stop maintenance mode
curl -X POST https://medtoolshub.cloud/api/maintenance \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"active":false}'
```

## 🆘 Troubleshooting

### WebAuthn not working on production
- Verify RP_ID matches domain exactly
- Check HTTPS is enforced
- Verify domain in certificate matches

### Database connection issues
- Check DATABASE_URL is correct
- Verify firewall allows port 5432
- Test connection: `psql $DATABASE_URL`

### Email not sending
- Verify SMTP credentials
- Check firewall allows port 465
- Review logs for SMTP errors

### High memory usage
- Check for memory leaks: `pm2 logs`
- Restart periodically: `0 0 * * * pm2 restart all`
- Increase Node.js heap if needed: `NODE_OPTIONS=--max-old-space-size=2048`

---

**Deployment Status**: Ready for production
**Last Updated**: November 26, 2025
