# ChromaDB Dashboard - EC2 Deployment Guide

## Prerequisites

1. **EC2 Instance Setup**
   - Amazon Linux 2 or Ubuntu 20.04+
   - Security Group allowing inbound traffic on ports 3002, 3004
   - At least t3.small instance (2GB RAM recommended)

2. **Install Dependencies**
   ```bash
   # Update system
   sudo yum update -y  # Amazon Linux
   # or
   sudo apt update && sudo apt upgrade -y  # Ubuntu

   # Install Node.js 18+
   curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
   sudo yum install -y nodejs git

   # Verify installation
   node --version
   npm --version
   ```

## Deployment Methods

### Method 1: Using nohup (Simple)

1. **Deploy the application**
   ```bash
   # Clone/upload your project
   cd /home/ec2-user
   git clone <your-repo-url> api-ui
   cd api-ui

   # Install dependencies
   npm install

   # Build for production
   npm run build

   # Make scripts executable
   chmod +x scripts/start-services.sh
   ```

2. **Start services with nohup**
   ```bash
   # Option A: Use the provided script
   ./scripts/start-services.sh start

   # Option B: Manual nohup commands
   # Start Tenant Data Server
   nohup node server/tenantDataServer.cjs > logs/tenant-server.log 2>&1 &
   echo $! > pids/tenant-server.pid

   # Start Vite Preview Server
   nohup npm run preview -- --port 3002 --host 0.0.0.0 > logs/vite-server.log 2>&1 &
   echo $! > pids/vite-server.pid
   ```

3. **Manage services**
   ```bash
   # Check status
   ./scripts/start-services.sh status

   # Stop services
   ./scripts/start-services.sh stop

   # Restart services
   ./scripts/start-services.sh restart

   # View logs
   tail -f logs/vite-server.log
   tail -f logs/tenant-server.log
   ```

### Method 2: Using systemd (Recommended for Production)

1. **Install systemd services**
   ```bash
   # Copy service files
   sudo cp scripts/chromadb-dashboard.service /etc/systemd/system/
   sudo cp scripts/chromadb-tenant-server.service /etc/systemd/system/

   # Reload systemd
   sudo systemctl daemon-reload

   # Enable services (start on boot)
   sudo systemctl enable chromadb-dashboard.service
   sudo systemctl enable chromadb-tenant-server.service
   ```

2. **Start services**
   ```bash
   # Start tenant server first
   sudo systemctl start chromadb-tenant-server.service

   # Start dashboard
   sudo systemctl start chromadb-dashboard.service

   # Check status
   sudo systemctl status chromadb-dashboard.service
   sudo systemctl status chromadb-tenant-server.service
   ```

3. **Manage services**
   ```bash
   # Stop services
   sudo systemctl stop chromadb-dashboard.service
   sudo systemctl stop chromadb-tenant-server.service

   # Restart services
   sudo systemctl restart chromadb-dashboard.service
   sudo systemctl restart chromadb-tenant-server.service

   # View logs
   sudo journalctl -u chromadb-dashboard.service -f
   sudo journalctl -u chromadb-tenant-server.service -f
   ```

## Configuration

1. **Environment Variables**
   ```bash
   # Edit .env.production
   nano .env.production

   # Update CHROMA_URL to your ChromaDB instance
   CHROMA_URL=https://your-chroma-instance.com
   ```

2. **Security Group Settings**
   - Inbound Rules:
     - Port 3002 (Dashboard): Source 0.0.0.0/0 or your IP range
     - Port 3004 (Tenant API): Source 127.0.0.1/32 (localhost only)
     - Port 22 (SSH): Source your IP range

## Access Your Application

After deployment, access your dashboard at:
- **Dashboard**: `http://YOUR-EC2-PUBLIC-IP:3002`
- **Tenant API**: `http://YOUR-EC2-PUBLIC-IP:3004` (if exposed)

## Troubleshooting

1. **Check if services are running**
   ```bash
   # Using nohup method
   ./scripts/start-services.sh status

   # Using systemd method
   sudo systemctl status chromadb-dashboard.service
   sudo systemctl status chromadb-tenant-server.service
   ```

2. **Check logs**
   ```bash
   # nohup logs
   tail -f logs/vite-server.log
   tail -f logs/tenant-server.log

   # systemd logs
   sudo journalctl -u chromadb-dashboard.service --since "1 hour ago"
   sudo journalctl -u chromadb-tenant-server.service --since "1 hour ago"
   ```

3. **Common issues**
   - **Port already in use**: Kill existing processes or change ports
   - **Permission denied**: Check file permissions and user ownership
   - **Cannot connect to ChromaDB**: Verify CHROMA_URL and network connectivity

## Monitoring

1. **Process monitoring**
   ```bash
   # Check running processes
   ps aux | grep node
   ps aux | grep npm

   # Check port usage
   netstat -tlnp | grep :3002
   netstat -tlnp | grep :3004
   ```

2. **Resource monitoring**
   ```bash
   # Check system resources
   htop
   free -h
   df -h
   ```

## Backup

1. **Backup tenant data**
   ```bash
   # Copy tenant data file
   cp src/data/tenants.json backups/tenants-$(date +%Y%m%d-%H%M%S).json
   ```

2. **Backup logs**
   ```bash
   # Archive logs
   tar -czf backups/logs-$(date +%Y%m%d-%H%M%S).tar.gz logs/
   ```

## Auto-start on Boot

For nohup method, add to `/etc/rc.local`:
```bash
# Add before 'exit 0'
su - ec2-user -c 'cd /home/ec2-user/api-ui && ./scripts/start-services.sh start'
```

For systemd method, services are already configured to start on boot.
