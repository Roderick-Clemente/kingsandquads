/**
 * PM2 Ecosystem Configuration for Kings and Quadraphages
 *
 * This file configures PM2 process manager for the game server.
 * PM2 provides automatic restarts, log management, and process monitoring.
 *
 * Setup on Raspberry Pi:
 *   1. Install PM2: npm install -g pm2
 *   2. Start app: pm2 start ecosystem.config.js
 *   3. Save config: pm2 save
 *   4. Auto-start on boot: pm2 startup
 *
 * Useful commands:
 *   - pm2 status        - View running processes
 *   - pm2 logs          - View application logs
 *   - pm2 restart all   - Restart application
 *   - pm2 stop all      - Stop application
 *   - pm2 monit         - Real-time monitoring dashboard
 */

module.exports = {
  apps: [{
    name: 'kingsandquads',
    script: './server.js',

    // Process management
    instances: 1,
    autorestart: true,
    watch: false,  // Don't watch files in production
    max_memory_restart: '200M',  // Restart if memory exceeds 200MB

    // Environment configuration
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },

    // Logging
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,

    // Advanced features
    kill_timeout: 5000,  // Time to wait before force killing process
    listen_timeout: 3000,  // Time to wait for app to be ready
    shutdown_with_message: true
  }]
};
