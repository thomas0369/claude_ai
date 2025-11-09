# PM2 Setup Guide

PM2 is now installed globally and ready to use in your projects.

## What is PM2?

PM2 is a production-grade process manager for Node.js applications. In development, it lets you:
- Run multiple services simultaneously (microservices, monorepo)
- Auto-restart services on crashes
- View consolidated logs from all services
- Monitor resource usage (CPU, memory)
- Manage processes with simple commands

## Quick Start

### 1. Create Configuration in Your Project

Copy the example config to your project root:
```bash
cp ~/.claude/ecosystem.config.example.js /path/to/your/project/ecosystem.config.js
```

### 2. Customize for Your Services

Edit `ecosystem.config.js` to match your project structure:
```javascript
module.exports = {
  apps: [
    {
      name: 'api',
      script: 'npm',
      args: 'start',
      cwd: './api',
      error_file: './api/logs/error.log',
      out_file: './api/logs/out.log',
    },
    // Add more services...
  ]
};
```

### 3. Start All Services

```bash
cd /path/to/your/project
pm2 start ecosystem.config.js
```

## Common Commands

```bash
# Start all services
pm2 start ecosystem.config.js

# Start with auto-restart on file changes
pm2 start ecosystem.config.js --watch

# View all processes
pm2 list

# View logs (all services)
pm2 logs

# View logs for specific service
pm2 logs api-service

# Monitor resource usage
pm2 monit

# Restart specific service
pm2 restart api-service

# Stop specific service
pm2 stop api-service

# Stop all services
pm2 stop all

# Delete all processes from PM2
pm2 delete all
```

## Integration with Claude Code

As mentioned in the Reddit post "Claude Code is a Beast", PM2 helps with:

### Before PM2:
- "The email service is throwing errors"
- Claude: "Let me check that service... where do I run it?"
- You: "cd into email/, then npm start"
- Claude: "Okay, starting... wait, what about the database connection?"

### After PM2:
- "The email service is throwing errors"
- Claude: "Checking email service logs..."
- `pm2 logs email-service --lines 50`
- Immediately sees the exact error with full context

### Workflow Example:

**In your CLAUDE.md (project-specific file):**
```markdown
## Quick Commands

Start all services: `pm2 start ecosystem.config.js`
Stop all services: `pm2 stop all`
View logs: `pm2 logs`
Restart service: `pm2 restart [service-name]`
```

Now when Claude needs to debug or check logs, it can use PM2 commands directly.

## Best Practices

1. **Create logs directories:** Ensure log paths exist before starting PM2
   ```bash
   mkdir -p api/logs frontend/logs services/worker/logs
   ```

2. **Use meaningful service names:** Makes it easy to identify in logs
   ```javascript
   name: 'api-auth-service'  // Good
   name: 'server1'           // Bad
   ```

3. **Set environment variables:** Configure per environment
   ```javascript
   env: {
     NODE_ENV: 'development',
     PORT: 3000,
     DATABASE_URL: 'postgresql://localhost:5432/dev'
   }
   ```

4. **Review logs regularly:**
   ```bash
   pm2 logs --lines 100  # Last 100 lines from all services
   ```

5. **Clean up when done:**
   ```bash
   pm2 delete all  # Stop and remove all processes
   ```

## Auto-Startup (Optional)

To make PM2 start your services on system boot:
```bash
# Save current process list
pm2 save

# Generate and configure startup script
pm2 startup
```

## Troubleshooting

**Services not starting?**
- Check that the `cwd` path is correct
- Verify the script command works manually (`npm start` in the directory)
- Check logs: `pm2 logs [service-name] --err`

**High memory usage?**
- Monitor with: `pm2 monit`
- Restart service: `pm2 restart [service-name]`
- Consider using `max_memory_restart` option in config

**Logs not appearing?**
- Ensure log directories exist
- Check file permissions
- Use absolute paths if needed

## Example: Monorepo Setup

For a monorepo with multiple services:

```javascript
module.exports = {
  apps: [
    {
      name: 'auth-api',
      script: 'npm',
      args: 'start',
      cwd: './services/auth',
      error_file: './services/auth/logs/error.log',
      out_file: './services/auth/logs/out.log',
    },
    {
      name: 'user-api',
      script: 'npm',
      args: 'start',
      cwd: './services/users',
      error_file: './services/users/logs/error.log',
      out_file: './services/users/logs/out.log',
    },
    {
      name: 'frontend',
      script: 'npm',
      args: 'run dev',
      cwd: './apps/web',
      error_file: './apps/web/logs/error.log',
      out_file: './apps/web/logs/out.log',
    }
  ]
};
```

Start all: `pm2 start ecosystem.config.js`

## Resources

- Official Docs: https://pm2.keymetrics.io/docs/usage/quick-start/
- Ecosystem File: https://pm2.keymetrics.io/docs/usage/application-declaration/
- Process Management: https://pm2.keymetrics.io/docs/usage/process-management/

---

**PM2 Version:** 6.0.13
**Installed:** Globally via npm
**Location:** `~/.nvm/versions/node/v22.19.0/bin/pm2`
