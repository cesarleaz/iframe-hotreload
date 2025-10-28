# System Overview

## What is the Iframe Hot-Reload System?

A standalone development tool that allows you to run multiple web applications with:
- Unique subdomain URLs
- Automatic hot-reload detection
- Console log capture
- WebSocket proxying for HMR

## Core Features

### 1. Subdomain-Based URL Generation

Each app gets a unique URL based on its folder name:

```
apps/my-first-app/  →  http://my-first-app.localhost:9100
apps/dashboard/     →  http://dashboard.localhost:9100
apps/api-demo/      →  http://api-demo.localhost:9100
```

### 2. Hot-Reload Detection

The system automatically detects when your app reloads:
- Vite HMR updates
- File changes
- Manual page refresh

When a reload happens:
1. Shim detects `beforeunload` event
2. Sends notification to parent
3. Console logs are cleared
4. New version loads

### 3. Console Capture

All console output from your app is captured and displayed:
- `console.log()`
- `console.warn()`
- `console.error()`
- `console.info()`
- `console.debug()`
- Uncaught errors
- Unhandled promise rejections

### 4. WebSocket Proxying

Full support for WebSocket connections:
- Vite HMR
- Socket.io
- WebSocket API
- Server-Sent Events

### 5. Multi-App Management

Run multiple apps simultaneously:
- Each app has isolated port
- Independent processes
- Separate environments
- No cross-app interference

## Use Cases

### 1. Multi-Project Development

Work on multiple projects without switching contexts:

```
apps/
├── frontend/      → React app
├── admin/         → Vue admin panel
├── landing/       → Marketing site
└── docs/          → Documentation
```

Access all at once:
- `http://frontend.localhost:9100`
- `http://admin.localhost:9100`
- `http://landing.localhost:9100`
- `http://docs.localhost:9100`

### 2. Microservices Development

Test microservices together:

```
apps/
├── gateway/       → API Gateway
├── auth-service/  → Authentication
├── user-service/  → User management
└── ui/            → Frontend UI
```

### 3. Client Demos

Show multiple demos to clients:

```
apps/
├── demo-v1/       → First version
├── demo-v2/       → Updated version
├── demo-beta/     → Beta features
└── demo-custom/   → Client-specific
```

### 4. Framework Comparison

Test same app in different frameworks:

```
apps/
├── react-version/
├── vue-version/
├── svelte-version/
└── vanilla-version/
```

### 5. A/B Testing

Run multiple versions for comparison:

```
apps/
├── version-a/     → Control
├── version-b/     → Variant 1
└── version-c/     → Variant 2
```

## How It Works

### Startup Process

1. **Server starts** on port 9100
2. **Scans apps/** directory
3. **Generates subdomain** for each folder
4. **Allocates port** for each app (9200, 9201, etc.)
5. **Registers apps** in app manager
6. **Starts proxy** for subdomain routing

### Request Lifecycle

```
User navigates to my-app.localhost:9100
    ↓
Main server receives request
    ↓
Extracts subdomain "my-app"
    ↓
Looks up app config
    ↓
Proxies to localhost:9200 (app's port)
    ↓
App responds with HTML
    ↓
Server injects shim script
    ↓
Returns modified HTML to user
    ↓
Shim starts capturing console logs
```

### Console Log Lifecycle

```
App calls console.log("Hello")
    ↓
Shim intercepts the call
    ↓
Original console.log executes
    ↓
Shim formats the message
    ↓
Sends via postMessage to parent
    ↓
Parent receives message
    ↓
Displays in console panel
```

### Hot-Reload Lifecycle

```
File changes in app
    ↓
Vite detects change
    ↓
Sends HMR update via WebSocket
    ↓
Browser applies update
    ↓
(If full reload needed)
    ↓
beforeunload event fires
    ↓
Shim sends "will-reload" message
    ↓
Parent clears console
    ↓
Page reloads
    ↓
New version loads
    ↓
Shim reinitializes
```

## Components Breakdown

### Server Components

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| Main Server | HTTP/WebSocket server | Hono-based, port 9100 |
| App Manager | App lifecycle | Registry, port allocation |
| Proxy Route | Request routing | Subdomain parsing, proxying |
| Shim Route | Serve shim script | Static file serving |
| WebSocket Proxy | WS connections | HMR support, bidirectional |
| Port Manager | Port allocation | Sequential, conflict detection |
| Subdomain Utils | URL handling | Parsing, validation, generation |

### Client Components

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| Shim Client | Browser injection | Console capture, messaging |
| Iframe Viewer | Visual interface | URL input, console panel |
| Fallback Page | Loading state | Beautiful UI, status updates |

## Configuration

### Environment Variables

```env
# Server Configuration
PORT=9100                    # Main server port
RUNTIME_BASE_PORT=9200      # Starting port for apps
NODE_ENV=development        # Environment mode

# Domain Configuration
LOCALHOST_DOMAIN=localhost
LOOPBACK_DOMAIN=app.local

# Timeouts
STARTUP_TIMEOUT_MS=60000
INSTALL_TIMEOUT_MS=300000
```

### App Requirements

Apps must:
1. Listen on assigned port
2. Serve HTML content
3. Support hot-reload (optional)
4. Have valid folder name (alphanumeric + hyphens)

### Supported Frameworks

Works with any framework that:
- Serves HTML
- Runs a dev server
- (Optional) Supports WebSocket

Examples:
- ✅ Vite (React, Vue, Svelte, etc.)
- ✅ Create React App
- ✅ Next.js
- ✅ Nuxt
- ✅ SvelteKit
- ✅ Plain HTML + http-server
- ✅ Express.js
- ✅ Fastify
- ✅ Any static site generator

## Comparison to Alternatives

### vs. Nginx Proxy

| Feature | This System | Nginx |
|---------|-------------|-------|
| Setup | Zero config | Config files required |
| Subdomains | Automatic | Manual setup |
| Hot-reload | Built-in | Not supported |
| Console capture | Yes | No |
| WebSocket proxy | Automatic | Manual config |

### vs. Traefik

| Feature | This System | Traefik |
|---------|-------------|---------|
| Learning curve | Low | High |
| Container focus | No | Yes |
| Subdomain routing | Built-in | Labels required |
| Console capture | Yes | No |
| Hot-reload detection | Yes | No |

### vs. Localhost Tunnel (ngrok)

| Feature | This System | ngrok |
|---------|-------------|-------|
| Purpose | Multi-app dev | External access |
| Subdomains | Built-in | Paid feature |
| Speed | Local | Network latency |
| Console capture | Yes | No |
| Hot-reload | Yes | Passthrough |

## Limitations

### Current Limitations

1. **Localhost only** (development focus)
2. **No authentication** (add if needed)
3. **In-memory storage** (apps lost on restart)
4. **No process management** (apps must run separately)
5. **No SSL in dev** (HTTP only locally)

### Production Considerations

For production use, add:
- Database for app registry
- User authentication
- SSL/TLS certificates
- Process manager (PM2)
- Persistent storage
- Monitoring/logging
- Error tracking

## Future Enhancements

Potential additions:
- [ ] Automatic app detection and startup
- [ ] Built-in terminal for app logs
- [ ] App health monitoring
- [ ] One-click app creation
- [ ] Template system
- [ ] Plugin architecture
- [ ] Real-time collaboration
- [ ] Network traffic inspection
- [ ] Performance profiling

## Getting Help

- **Documentation**: Check `/docs` folder
- **Examples**: See `/examples` folder
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

## Contributing

To contribute:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit pull request

## License

MIT License - free for any use
