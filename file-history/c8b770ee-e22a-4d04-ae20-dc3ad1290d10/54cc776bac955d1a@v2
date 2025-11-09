// PM2 Ecosystem Configuration Example
// Based on the Reddit post "Claude Code is a Beast – Tips from 6 Months of Hardcore Use"
//
// Copy this file to your project root as ecosystem.config.js and customize for your services
// Usage:
//   Start all services: pm2 start ecosystem.config.js
//   Start specific service: pm2 start ecosystem.config.js --only api-service
//   Stop all: pm2 stop all
//   Restart all: pm2 restart all
//   View logs: pm2 logs
//   Monitor: pm2 monit
//   List processes: pm2 list

module.exports = {
  apps: [
    // Example: Backend API Service
    {
      name: 'api-service',
      script: 'npm',
      args: 'start',
      cwd: './api',                    // Path to your API service
      error_file: './api/logs/error.log',
      out_file: './api/logs/out.log',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      }
    },

    // Example: Frontend Development Server
    {
      name: 'frontend-dev',
      script: 'npm',
      args: 'run dev',
      cwd: './frontend',               // Path to your frontend
      error_file: './frontend/logs/error.log',
      out_file: './frontend/logs/out.log',
      env: {
        NODE_ENV: 'development',
        PORT: 5173
      }
    },

    // Example: Background Worker Service
    {
      name: 'worker-service',
      script: 'npm',
      args: 'run worker',
      cwd: './services/worker',
      error_file: './services/worker/logs/error.log',
      out_file: './services/worker/logs/out.log',
      env: {
        NODE_ENV: 'development'
      }
    },

    // Example: Database Service (if you need to run a local DB process)
    // {
    //   name: 'postgres-local',
    //   script: 'postgres',
    //   args: '-D /usr/local/var/postgres',
    //   error_file: './logs/postgres-error.log',
    //   out_file: './logs/postgres-out.log'
    // },

    // Add more services as needed for your monorepo/microservices setup
  ]
};

// Common PM2 Commands for Development:
//
// Start all services:
//   pm2 start ecosystem.config.js
//
// Start in watch mode (auto-restart on file changes):
//   pm2 start ecosystem.config.js --watch
//
// View logs for specific service:
//   pm2 logs api-service
//
// View logs for all services:
//   pm2 logs
//
// Monitor resource usage:
//   pm2 monit
//
// Stop specific service:
//   pm2 stop api-service
//
// Restart specific service:
//   pm2 restart api-service
//
// Delete all processes:
//   pm2 delete all
//
// Save process list (auto-restart on reboot):
//   pm2 save
//   pm2 startup
//
// For more info: https://pm2.keymetrics.io/docs/usage/quick-start/
