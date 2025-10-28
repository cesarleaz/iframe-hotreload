# Iframe Hot-Reload System

A standalone system for managing multiple apps with unique subdomain URLs and automatic hot-reload support.

## Features

- **Subdomain-based routing**: Each app gets a unique URL (e.g., `my-app.localhost:9100`)
- **Hot-reload support**: Changes to app code automatically reload the iframe
- **Console capture**: App console logs are captured and displayed in the parent
- **WebSocket proxying**: Full HMR (Hot Module Replacement) support for Vite
- **Multi-app management**: Run multiple apps simultaneously with isolated environments

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start the server
npm run dev
```

The server will start on `http://localhost:9100`

### Creating an App

1. Create a new directory in `apps/`:

```bash
mkdir apps/my-first-app
cd apps/my-first-app
npm init -y
```

2. Add a simple HTML file or Vite project:

```bash
# For a simple HTML app
echo '<h1>Hello World</h1>' > index.html
npx serve -p 9200

# Or create a Vite app
npm create vite@latest . -- --template vanilla
npm install
npm run dev -- --port 9200
```

3. Access your app at: `http://my-first-app.localhost:9100`

## How It Works

### Architecture

```
┌─────────────────────────────────────────┐
│  Main Hono Server (Port 9100)          │
│  - Subdomain routing                    │
│  - Proxy to app runtimes                │
│  - Shim injection                       │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
┌───────▼──────┐    ┌────────▼─────┐
│ App Runtime  │    │ App Runtime  │
│ (Port 9200)  │    │ (Port 9201)  │
│ my-first-app │    │ another-app  │
└──────────────┘    └──────────────┘
```

### Subdomain System

Each app is assigned a unique subdomain based on its folder name:
- `apps/my-app/` → `http://my-app.localhost:9100`
- `apps/test-app/` → `http://test-app.localhost:9100`

### Shim Client

The system injects a "shim" script into all HTML responses that:
1. Captures console logs (log, warn, error, etc.)
2. Sends them to the parent window via `postMessage`
3. Listens for reload commands
4. Handles iframe communication

### Hot-Reload

When the app's dev server reloads (via Vite HMR or similar):
1. The shim detects the reload via `beforeunload` event
2. Sends a "will-reload" message to parent
3. Parent clears console logs
4. Iframe automatically reloads with the new content

## Configuration

### Environment Variables

Create a `.env` file:

```env
PORT=9100
RUNTIME_BASE_PORT=9200
NODE_ENV=development
```

### Custom Domains

For production, you can configure custom domains in `src/server/constants.js`:

```javascript
export const DOMAINS = ['yourdomain.com', 'localhost'];
```

## Deployment on Render.com

See [docs/render-deployment.md](./docs/render-deployment.md) for detailed instructions.

Quick steps:
1. Push code to GitHub
2. Create a new Web Service on Render
3. Connect your repository
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables
7. Deploy!

## API

### Server API

The main server exposes these endpoints:

- `GET /` - Lists all running apps
- `GET /_system/shim/shim.js` - Shim client script
- `ALL /*` - Proxy to app runtime (based on subdomain)

### Shim Client API

Messages sent from shim to parent:

```javascript
// Console log
{
  type: 'console-log',
  value: { message: string, type: 'log' | 'warn' | 'error' }
}

// Before reload
{
  type: 'will-reload'
}

// Open console request
{
  type: 'open-console'
}
```

Messages sent from parent to shim:

```javascript
// Force reload
{
  type: 'reload-window'
}

// Navigate back
{
  type: 'history-back'
}

// Navigate forward
{
  type: 'history-forward'
}
```

## Testing

```bash
npm test
```

Tests cover:
- URL generation
- Subdomain parsing
- Proxy routing
- Shim injection
- Console capture

## License

MIT
