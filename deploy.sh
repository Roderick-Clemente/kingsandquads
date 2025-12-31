#!/bin/bash

# Simple deployment script for Kings and Quadraphages on Raspberry Pi
# Run from your local machine: ./deploy.sh

set -e  # Exit on any error

echo "🚀 Deploying Kings and Quadraphages to Raspberry Pi..."

# Configuration
PI_HOST="pioluv"
PI_USER="pi"
APP_DIR="/home/pi/kingsandquads"

echo "📡 Connecting to $PI_USER@$PI_HOST..."

ssh $PI_USER@$PI_HOST << 'ENDSSH'
    set -e

    echo "📂 Navigating to app directory..."
    cd /home/pi/kingsandquads

    echo "⬇️  Pulling latest changes from git..."
    git pull origin main

    echo "📦 Installing/updating dependencies..."
    npm install --production

    echo "🔄 Restarting application with PM2..."
    pm2 restart kingsandquads || pm2 start server.js --name kingsandquads

    echo "📊 PM2 Status:"
    pm2 status

    echo "✅ Deployment complete!"
ENDSSH

echo ""
echo "🎉 Deployment successful! Your game is live at http://pioluv:3000"
