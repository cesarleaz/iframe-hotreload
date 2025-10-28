# Simple HTML Example

A basic HTML page to test the iframe hot-reload system.

## How to Use

### 1. Copy to apps directory

```bash
cp -r examples/simple-html apps/my-test-app
```

### 2. Start a simple HTTP server

```bash
cd apps/my-test-app
npx serve -p 9200
```

Or use Python:
```bash
python3 -m http.server 9200
```

Or use Node.js http-server:
```bash
npx http-server -p 9200
```

### 3. Access your app

Open: `http://my-test-app.localhost:9100`

## Features Demonstrated

- **Console Logging**: Click buttons to test different log levels
- **Hot Reload**: Edit `index.html` and save to see changes
- **Error Handling**: Uncomment error lines to test error capture
- **Shim Injection**: View page source to see injected script

## Testing Console Capture

1. Click the colored buttons
2. Check the console panel on the right
3. See your logs appear in real-time

## Testing Hot Reload

1. Edit `index.html` (change title, colors, text)
2. Save the file
3. Refresh the page in your browser
4. The console should clear and reload

## Testing Error Capture

Uncomment these lines in the script:

```javascript
// Uncaught error
setTimeout(() => {
  throw new Error('This is an uncaught error!');
}, 3000);

// Unhandled promise rejection
setTimeout(() => {
  Promise.reject(new Error('This is an unhandled promise rejection!'));
}, 5000);
```

These errors will be captured and displayed in the console panel.
