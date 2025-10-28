# Quick Start Guide

Get up and running in 5 minutes!

## Installation

```bash
# Clone or navigate to the project
cd iframe-hotreload-system

# Install dependencies
npm install
```

## Start the Server

```bash
npm run dev
```

You'll see:
```
🚀 Starting Iframe Hot-Reload System...
📁 Scanning for apps...
ℹ️  No apps found in apps/ directory
✅ Server running on http://localhost:9100
💡 View all apps: http://localhost:9100
```

## Create Your First App

### Option 1: Simple HTML

```bash
# Copy the example
cp -r examples/simple-html apps/my-first-app

# Start a simple server
cd apps/my-first-app
npx serve -p 9200
```

Access at: **http://my-first-app.localhost:9100**

### Option 2: Vite + React

```bash
# Copy the example
cp -r examples/vite-react apps/my-react-app
cd apps/my-react-app

# Install and start
npm install
npm run dev
```

Access at: **http://my-react-app.localhost:9100**

### Option 3: Create From Scratch

```bash
# Create directory
mkdir apps/custom-app
cd apps/custom-app

# Create a simple HTML file
cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <title>My Custom App</title>
</head>
<body>
  <h1>Hello World!</h1>
  <script>
    console.log('App loaded!');
  </script>
</body>
</html>
EOF

# Start a server on port 9200
npx serve -p 9200
```

Access at: **http://custom-app.localhost:9100**

## Using the Iframe Viewer

Open `public/index.html` in your browser:

```bash
# Open directly
open public/index.html

# Or serve it
npx serve -s public -p 8080
# Then visit http://localhost:8080
```

In the viewer:
1. Enter your app URL (e.g., `http://my-first-app.localhost:9100`)
2. Click "Load"
3. Your app appears in the iframe
4. Console logs appear in the right panel
5. Edit your app code and save
6. Watch the hot-reload happen automatically!

## Testing Features

### Console Capture

```javascript
console.log('Normal log');
console.warn('Warning message');
console.error('Error message');
console.info('Info message');
```

All appear in the console panel!

### Hot Reload

1. Edit your app's HTML/JS/CSS
2. Save the file
3. Vite/dev server reloads
4. Iframe detects reload
5. Console clears
6. New version loads

### Error Handling

Uncaught errors are automatically captured:

```javascript
throw new Error('This will be captured!');

Promise.reject('This too!');
```

## Port Assignment

The system automatically assigns ports:
- Main server: **9100** (or PORT env var)
- First app: **9200**
- Second app: **9201**
- Third app: **9202**
- And so on...

## Subdomain Rules

Folder names become subdomains:
- `my-app` → `my-app.localhost:9100` ✅
- `test_app` → `test-app.localhost:9100` (sanitized) ✅
- `My App` → `my-app.localhost:9100` (sanitized) ✅
- `-invalid-` → Not allowed ❌

## Common Issues

### "App not found"

Make sure:
1. Your app's dev server is running
2. It's listening on the assigned port (9200+)
3. The folder name is valid

### Console not showing

Check:
1. The shim script is being injected (view page source)
2. Your app is returning HTML (not JSON)
3. There are no CORS errors

### Hot reload not working

Verify:
1. Your dev server supports HMR (Vite does by default)
2. WebSocket connections are allowed
3. The dev server is running

## Next Steps

- Read [docs/architecture.md](docs/architecture.md) for system details
- Check [docs/system-overview.md](docs/system-overview.md) for features
- See [docs/render-deployment.md](docs/render-deployment.md) for deployment
- Run tests: `npm test`

## Need Help?

- Check the [README.md](README.md)
- Look at examples in `examples/`
- Review documentation in `docs/`
- Open an issue on GitHub

Happy coding! 🚀
