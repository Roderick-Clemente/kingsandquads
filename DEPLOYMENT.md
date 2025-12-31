# Deployment Guide - Kings and Quadraphages

## Raspberry Pi Setup (One-time)

### 1. Install PM2
```bash
ssh pi@pioluv
npm install -g pm2
```

### 2. Create logs directory
```bash
cd ~/kingsandquads
mkdir -p logs
```

### 3. Start the application with PM2
```bash
pm2 start ecosystem.config.js
pm2 save  # Save process list for restarts
```

### 4. Enable auto-start on Pi boot
```bash
pm2 startup
# Follow the command it outputs (will be something like):
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u pi --hp /home/pi
```

### 5. Verify it's running
```bash
pm2 status
pm2 logs kingsandquads
```

---

## Deploying Updates (Anytime)

### From your local machine:
```bash
./deploy.sh
```

That's it! The script will:
- SSH into your Pi
- Pull latest code from GitHub
- Install any new dependencies
- Restart the application with PM2

---

## Useful PM2 Commands

### On the Raspberry Pi:

```bash
# View status of all processes
pm2 status

# View real-time logs
pm2 logs kingsandquads

# View last 100 lines of logs
pm2 logs kingsandquads --lines 100

# Monitor CPU/Memory usage
pm2 monit

# Restart the app
pm2 restart kingsandquads

# Stop the app
pm2 stop kingsandquads

# Start the app (if stopped)
pm2 start kingsandquads

# View detailed process info
pm2 info kingsandquads

# Clear log files
pm2 flush

# Remove app from PM2
pm2 delete kingsandquads
```

---

## Troubleshooting

### App won't start
```bash
# Check logs for errors
pm2 logs kingsandquads --err

# Manually test the server
cd ~/kingsandquads
node server.js
```

### Port 3000 already in use
```bash
# Find what's using the port
sudo lsof -i :3000

# Kill the process (replace PID with actual process ID)
kill -9 PID
```

### PM2 not starting on boot
```bash
# Re-run startup command
pm2 startup

# Ensure processes are saved
pm2 save
```

### Check Pi resource usage
```bash
# CPU and memory
htop

# Disk space
df -h

# Process list
pm2 monit
```

---

## Configuration

### Port Configuration
Edit `ecosystem.config.js` and change the `PORT` environment variable.

### Memory Limits
The app will auto-restart if it uses more than 200MB RAM (configured in `ecosystem.config.js`).

### Log Rotation
PM2 handles log files automatically. To manually clear old logs:
```bash
pm2 flush
```

---

## Monitoring

### Check if the game is accessible:
```bash
curl http://localhost:3000
```

### View active WebSocket connections:
PM2 doesn't show Socket.IO connections directly, but you can monitor them in the app logs:
```bash
pm2 logs kingsandquads | grep "player connected"
```

---

## Security Notes

- The deploy script uses SSH without password (assumes SSH key auth is set up)
- PM2 runs as the `pi` user (not root)
- Logs are stored in `~/kingsandquads/logs/` and should be rotated periodically
- Consider setting up a firewall (ufw) to restrict port 3000 access if needed

---

## Rollback

If a deployment breaks something:

```bash
ssh pi@pioluv
cd ~/kingsandquads
git log --oneline  # Find the commit to rollback to
git reset --hard <commit-hash>
pm2 restart kingsandquads
```

---

**Last Updated**: 2024-12-31
