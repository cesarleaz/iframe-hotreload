# Architecture Documentation

## Overview

The Iframe Hot-Reload System is a standalone application that provides subdomain-based routing and hot-reload capabilities for multiple web applications.

## System Components

### 1. Main Server (Hono)

**Location**: `src/server/index.js`

The main HTTP server that:
- Listens on port 9100 (configurable)
- Routes requests based on subdomain
- Injects shim script into HTML responses
- Proxies requests to app runtimes
- Handles WebSocket connections for HMR

### 2. App Manager

**Location**: `src/server/app-manager.js`

Manages app lifecycle:
- Scans `apps/` directory for available apps
- Assigns unique subdomains based on folder names
- Allocates ports for each app
- Maintains app registry and state

### 3. Subdomain System

**Location**: `src/server/utils/subdomain.js`

Handles subdomain parsing and validation:
- Extracts subdomain from host header
- Validates subdomain format (lowercase, alphanumeric, hyphens)
- Generates app URLs

**URL Format**: `http://[subdomain].localhost:[port]`

Example:
```
apps/my-app/ → http://my-app.localhost:9100
apps/test-123/ → http://test-123.localhost:9100
```

### 4. Port Manager

**Location**: `src/server/utils/port-manager.js`

Manages port allocation:
- Base port: 9200 (configurable)
- Checks port availability
- Allocates sequential ports
- Tracks allocated ports
- Releases ports when apps shut down

### 5. Shim Client

**Location**: `src/shim/shim-client.js`

JavaScript injected into app HTML:
- Intercepts console methods (log, warn, error, etc.)
- Captures uncaught errors and promise rejections
- Sends logs to parent window via `postMessage`
- Listens for reload commands
- Notifies parent before page reload

### 6. Proxy Routes

**Location**: `src/server/routes/proxy.js`

Main routing logic:
- Parses subdomain from request
- Looks up app configuration
- Proxies request to app's runtime port
- Injects shim script into HTML responses
- Handles errors with fallback page

### 7. WebSocket Proxy

**Location**: `src/server/websocket-proxy.js`

Enables HMR support:
- Intercepts WebSocket upgrade requests
- Proxies WebSocket connections to app runtime
- Maintains bidirectional message flow
- Handles connection lifecycle

## Data Flow

### HTTP Request Flow

```
Client Request
    ↓
Host Header Parsing
    ↓
Subdomain Extraction
    ↓
App Lookup
    ↓
Proxy to Runtime (localhost:920X)
    ↓
HTML Response?
    ↓
Inject Shim Script
    ↓
Return to Client
```

### Console Log Flow

```
App Console Log
    ↓
Shim Intercept
    ↓
Format Message
    ↓
postMessage to Parent
    ↓
Parent Receives
    ↓
Display in Console Panel
```

### Hot Reload Flow

```
File Change in App
    ↓
Vite HMR Triggers
    ↓
WebSocket Message
    ↓
Browser Reloads
    ↓
beforeunload Event
    ↓
Shim Sends 'will-reload'
    ↓
Parent Clears Console
    ↓
Page Reloads
    ↓
New Content Loaded
```

## Directory Structure

```
iframe-hotreload-system/
├── apps/                      # User apps (not committed)
│   ├── my-app/
│   └── another-app/
├── docs/                      # Documentation
│   ├── architecture.md
│   ├── render-deployment.md
│   └── system-overview.md
├── public/                    # Static frontend
│   └── index.html            # Iframe viewer UI
├── src/
│   ├── server/
│   │   ├── routes/
│   │   │   ├── proxy.js      # Main proxy routing
│   │   │   └── shim.js       # Shim script serving
│   │   ├── utils/
│   │   │   ├── subdomain.js  # Subdomain parsing
│   │   │   └── port-manager.js # Port allocation
│   │   ├── app-manager.js    # App lifecycle
│   │   ├── constants.js      # Configuration
│   │   ├── index.js          # Server entry point
│   │   └── websocket-proxy.js # WS proxying
│   └── shim/
│       ├── shim-client.js    # Injected client code
│       └── iframe-fallback.html # Loading page
├── tests/                     # Test files
├── .gitignore
├── package.json
└── README.md
```

## Key Design Decisions

### 1. Subdomain-Based Routing

**Why**: Provides isolated URLs for each app without path prefixes.

**Benefits**:
- Clean URLs
- Proper cookie isolation
- Service worker compatibility
- Mimics production environment

### 2. Shim Script Injection

**Why**: Capture console logs without modifying app code.

**Benefits**:
- Non-invasive
- Works with any framework
- Easy to enable/disable
- Transparent to app

### 3. WebSocket Proxy

**Why**: Enable Vite HMR and other WebSocket-based features.

**Benefits**:
- Full HMR support
- Live reload functionality
- Real-time updates
- Framework-agnostic

### 4. Port Allocation

**Why**: Each app needs its own port to run independently.

**Benefits**:
- Isolated processes
- Independent restarts
- No port conflicts
- Scalable architecture

## Security Considerations

### 1. Sandbox Attributes

Iframes use restrictive sandbox:
```html
sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
```

### 2. Subdomain Validation

Only valid subdomains are allowed:
- Lowercase letters
- Numbers
- Hyphens (not leading/trailing)
- Max 63 characters

### 3. Domain Whitelist

Only allowed domains can be used:
- `localhost`
- `app.local` (configurable)

### 4. Port Isolation

Each app runs on isolated port with no cross-app communication.

## Performance Considerations

### 1. Port Allocation

Sequential port checking with retry delays prevents resource exhaustion.

### 2. WebSocket Handling

Direct proxy without buffering maintains low latency for HMR.

### 3. HTML Injection

Script injection happens only for HTML responses, not other content types.

### 4. Console Batching

Console messages sent immediately via postMessage for real-time feedback.

## Extensibility

### Adding New Features

1. **Custom Routes**: Add new routes in `src/server/routes/`
2. **Middleware**: Add Hono middleware in `src/server/index.js`
3. **Shim Features**: Extend `src/shim/shim-client.js`
4. **App Metadata**: Extend app schema in `app-manager.js`

### Plugin System (Future)

Could add plugin support for:
- Custom authentication
- Analytics integration
- Custom dev tools
- Framework-specific features

## Troubleshooting

### Port Already in Use

Check allocated ports:
```javascript
appManager.portManager.getAllocatedPorts()
```

### Subdomain Not Resolving

Verify:
1. Host header contains subdomain
2. Domain is in allowed list
3. App is registered in app manager

### HMR Not Working

Check:
1. WebSocket proxy is running
2. App dev server supports HMR
3. WebSocket connection established

### Shim Not Injecting

Verify:
1. Response is HTML
2. Shim route is mounted
3. HTML has `<head>` tag
