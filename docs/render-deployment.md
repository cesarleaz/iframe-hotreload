# Deployment on Render.com

This guide explains how to deploy the Iframe Hot-Reload System on Render.com.

## Prerequisites

- GitHub account
- Render.com account (free tier available)
- Code pushed to a GitHub repository

## Deployment Steps

### 1. Prepare Your Repository

Ensure your repository has:
- `package.json` with proper `start` script
- `.gitignore` excluding `node_modules/` and `apps/`
- All source code committed

### 2. Create a New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the repository containing your code

### 3. Configure Build Settings

**Service Name**: `iframe-hotreload-system` (or your preferred name)

**Environment**: `Node`

**Region**: Choose closest to your users

**Branch**: `main` (or your default branch)

**Build Command**:
```bash
npm install
```

**Start Command**:
```bash
npm start
```

### 4. Set Environment Variables

Add these environment variables in Render dashboard:

| Key | Value | Description |
|-----|-------|-------------|
| `NODE_ENV` | `production` | Sets production mode |
| `PORT` | `9100` | Main server port (Render overrides this) |
| `RUNTIME_BASE_PORT` | `9200` | Base port for app runtimes |

### 5. Configure Instance Type

**Free Tier**:
- Good for testing
- Sleeps after 15 minutes of inactivity
- 512 MB RAM

**Starter ($7/month)**:
- Always on
- Better performance
- 512 MB RAM

**Standard ($25/month)**:
- Production ready
- 2 GB RAM
- Better CPU

### 6. Deploy

Click **"Create Web Service"**

Render will:
1. Clone your repository
2. Install dependencies
3. Start your server
4. Assign a public URL

### 7. Access Your App

Your service will be available at:
```
https://your-service-name.onrender.com
```

## Production Configuration

### Custom Domain

Instead of `localhost` subdomains, configure custom domains:

1. **Update constants.js**:
```javascript
export const LOCALHOST_DOMAIN = 'localhost';
export const LOOPBACK_DOMAIN = 'yourdomain.com';
export const ALLOWED_DOMAINS = [LOCALHOST_DOMAIN, LOOPBACK_DOMAIN];
```

2. **Add Custom Domain in Render**:
   - Go to Settings → Custom Domains
   - Add your domain
   - Configure DNS records

3. **Add Wildcard DNS**:
```
Type: CNAME
Name: *
Value: your-service-name.onrender.com
```

This enables subdomain routing like:
- `my-app.yourdomain.com`
- `test.yourdomain.com`

### Environment-Specific Configuration

Create production-specific settings:

```javascript
// src/server/constants.js
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const BASE_DOMAIN = IS_PRODUCTION 
  ? process.env.PRODUCTION_DOMAIN || 'yourdomain.com'
  : 'localhost';
```

### HTTPS Configuration

Render provides automatic HTTPS for all services.

Update URL generation to use HTTPS in production:

```javascript
export function generateAppUrl(subdomain, port, domain) {
  const protocol = IS_PRODUCTION ? 'https' : 'http';
  const portSuffix = IS_PRODUCTION ? '' : `:${port}`;
  return `${protocol}://${subdomain}.${domain}${portSuffix}`;
}
```

## Persistent Storage

Render's free tier has **ephemeral storage** - files are lost on restart.

### Option 1: Use Render Disks (Paid)

1. Go to Settings → Disks
2. Add a new disk
3. Mount path: `/apps`
4. Size: Based on your needs

### Option 2: External Storage

Use services like:
- **AWS S3**: For static files
- **MongoDB Atlas**: For app metadata
- **Redis Cloud**: For session data

### Option 3: Git-Based Apps

Store apps in Git repositories and clone on startup:

```javascript
// In app-manager.js
async function cloneAppFromGit(repoUrl, subdomain) {
  const appDir = join(PROJECT_ROOT, 'apps', subdomain);
  await exec(`git clone ${repoUrl} ${appDir}`);
  return appDir;
}
```

## Monitoring & Logs

### View Logs

In Render dashboard:
1. Go to your service
2. Click **"Logs"** tab
3. View real-time logs

### Health Checks

Add a health check endpoint:

```javascript
// In src/server/index.js
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    uptime: process.uptime(),
    apps: appManager.getAllApps().length
  });
});
```

Configure in Render:
- Health Check Path: `/health`
- Health Check Interval: 30 seconds

### Error Tracking

Integrate error tracking service:

```javascript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

## Scaling Considerations

### Horizontal Scaling

For multiple instances:
1. Use external session storage (Redis)
2. Share app registry across instances
3. Use load balancer for WebSocket sticky sessions

### Vertical Scaling

Upgrade instance type in Render:
- Settings → Instance Type
- Choose larger instance

### Database for App Registry

Replace in-memory app storage with database:

```javascript
// Use PostgreSQL, MongoDB, or Redis
class DatabaseAppManager extends AppManager {
  async registerApp(config) {
    // Save to database
    await db.apps.insert(config);
    return config;
  }
  
  async getApp(subdomain) {
    // Load from database
    return await db.apps.findOne({ subdomain });
  }
}
```

## Troubleshooting

### Service Won't Start

Check logs for:
- Missing dependencies
- Port conflicts
- Environment variable issues

### Subdomains Not Working

Verify:
1. Wildcard DNS is configured
2. Custom domain is added in Render
3. `ALLOWED_DOMAINS` includes your domain

### WebSocket Errors

Ensure:
1. Render supports WebSockets (it does)
2. WebSocket upgrade handler is configured
3. No proxy buffering issues

### Apps Not Persisting

Remember:
- Free tier has ephemeral storage
- Use Render Disks or external storage
- Apps are lost on service restart

## Cost Optimization

### Free Tier Tips

- Service sleeps after 15 min inactivity
- First request after sleep is slow
- 750 hours/month free (one always-on service)

### Reduce Costs

1. **Use Starter tier** for always-on service
2. **Optimize build time** to reduce build minutes
3. **Use external storage** instead of Render Disks
4. **Cache dependencies** in Docker

## Security Best Practices

### Environment Variables

Never commit:
- API keys
- Database credentials
- Secret tokens

Store in Render environment variables.

### HTTPS Only

Force HTTPS in production:

```javascript
app.use('*', async (c, next) => {
  if (IS_PRODUCTION && c.req.header('x-forwarded-proto') !== 'https') {
    return c.redirect(`https://${c.req.header('host')}${c.req.path}`);
  }
  await next();
});
```

### Rate Limiting

Add rate limiting:

```javascript
import { rateLimiter } from 'hono-rate-limiter';

app.use('*', rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // max requests per window
}));
```

## Example Deployment

Complete deployment example:

### 1. Update package.json

```json
{
  "scripts": {
    "start": "NODE_ENV=production node src/server/index.js",
    "build": "echo 'No build step required'"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 2. Add render.yaml

```yaml
services:
  - type: web
    name: iframe-hotreload
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: RUNTIME_BASE_PORT
        value: 9200
```

### 3. Deploy

```bash
git add .
git commit -m "Configure for Render deployment"
git push origin main
```

Render will automatically deploy on push!

## Support

For issues:
- Check [Render Status](https://status.render.com/)
- View [Render Docs](https://render.com/docs)
- Contact Render Support
- Check GitHub Issues

## Next Steps

After deployment:
1. Configure custom domain
2. Set up monitoring
3. Add health checks
4. Configure backups
5. Test scaling
