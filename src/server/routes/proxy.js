import { Hono } from 'hono';
import { parseHost } from '../utils/subdomain.js';
import { SHIM_SCRIPT_PATH } from '../constants.js';

const app = new Hono();

/**
 * Main proxy route - handles all requests and routes to appropriate app
 */
app.all('/*', async (c) => {
  const appManager = c.get('appManager');
  const host = c.req.header('host') || '';
  
  // Parse subdomain from host
  const hostInfo = parseHost(host);
  
  // No subdomain - show app list
  if (!hostInfo) {
    if (c.req.path === '/') {
      return showAppList(c, appManager);
    }
    return c.notFound();
  }
  
  const { subdomain } = hostInfo;
  
  // Get app config
  const app = appManager.getApp(subdomain);
  if (!app) {
    return c.html(getFallbackPage(), 404);
  }
  
  // Proxy to app runtime
  try {
    const targetUrl = `${app.proxyTarget}${c.req.path}${c.req.url.includes('?') ? '?' + c.req.url.split('?')[1] : ''}`;
    
    const response = await fetch(targetUrl, {
      method: c.req.method,
      headers: {
        ...Object.fromEntries(c.req.raw.headers),
        'X-Forwarded-For': c.req.header('x-forwarded-for') || '127.0.0.1',
        'X-Forwarded-Host': host,
        'X-Forwarded-Proto': 'http'
      },
      body: c.req.method !== 'GET' && c.req.method !== 'HEAD' ? c.req.raw.body : undefined
    });
    
    // Check if response is HTML
    const contentType = response.headers.get('content-type') || '';
    const isHtml = contentType.includes('text/html');
    
    if (isHtml) {
      // Inject shim script into HTML
      const html = await response.text();
      const injectedHtml = injectShimScript(html);
      
      return c.html(injectedHtml, response.status);
    }
    
    // Pass through non-HTML responses
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
    
  } catch (err) {
    console.error(`Proxy error for ${subdomain}:`, err.message);
    return c.html(getFallbackPage(), 503);
  }
});

/**
 * Injects the shim script into HTML
 */
function injectShimScript(html) {
  const shimScript = `<script src="${SHIM_SCRIPT_PATH}" type="module"></script>`;
  
  // Try to inject after <head> tag
  if (html.includes('<head>')) {
    return html.replace('<head>', `<head>${shimScript}`);
  }
  
  // Try to inject before </head> tag
  if (html.includes('</head>')) {
    return html.replace('</head>', `${shimScript}</head>`);
  }
  
  // Try to inject after <html> tag
  if (html.includes('<html>')) {
    return html.replace('<html>', `<html><head>${shimScript}</head>`);
  }
  
  // Fallback: prepend to entire document
  return shimScript + html;
}

/**
 * Returns fallback page HTML
 */
function getFallbackPage() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>App Not Available</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .message {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 { color: #333; margin-bottom: 1rem; }
    p { color: #666; }
  </style>
</head>
<body>
  <div class="message">
    <h1>⏳ App Starting...</h1>
    <p>The application is initializing. Please wait a moment and refresh.</p>
  </div>
</body>
</html>`;
}

/**
 * Shows list of all registered apps
 */
function showAppList(c, appManager) {
  const apps = appManager.getAllApps();
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>App Manager</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #f8f9fa;
      padding: 2rem;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 {
      color: #212529;
      margin-bottom: 2rem;
      font-size: 2rem;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: #667eea;
    }
    .stat-label {
      color: #6c757d;
      font-size: 0.9rem;
      margin-top: 0.5rem;
    }
    .apps-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .app-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .app-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .app-name {
      font-size: 1.25rem;
      font-weight: 600;
      color: #212529;
      margin-bottom: 0.5rem;
    }
    .app-subdomain {
      color: #667eea;
      font-family: monospace;
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }
    .app-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      color: #6c757d;
    }
    .app-info-row {
      display: flex;
      justify-content: space-between;
    }
    .app-status {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-registered {
      background: #d1ecf1;
      color: #0c5460;
    }
    .app-link {
      display: inline-block;
      width: 100%;
      padding: 0.75rem;
      background: #667eea;
      color: white;
      text-decoration: none;
      text-align: center;
      border-radius: 6px;
      font-weight: 500;
      transition: background 0.2s;
    }
    .app-link:hover {
      background: #5568d3;
    }
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .empty-state h2 {
      color: #6c757d;
      margin-bottom: 1rem;
    }
    .empty-state p {
      color: #adb5bd;
      line-height: 1.6;
    }
    .empty-state code {
      background: #f8f9fa;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 App Manager</h1>
    
    <div class="stats">
      <div class="stat-card">
        <div class="stat-value">${apps.length}</div>
        <div class="stat-label">Registered Apps</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${appManager.portManager.getAllocatedPorts().length}</div>
        <div class="stat-label">Allocated Ports</div>
      </div>
    </div>
    
    ${apps.length === 0 ? `
      <div class="empty-state">
        <h2>No apps found</h2>
        <p>
          Create a new app by adding a directory in <code>apps/</code><br>
          Each directory will automatically get its own subdomain URL.
        </p>
      </div>
    ` : `
      <div class="apps-grid">
        ${apps.map(app => `
          <div class="app-card">
            <div class="app-name">${app.name}</div>
            <div class="app-subdomain">${app.subdomain}</div>
            <div class="app-info">
              <div class="app-info-row">
                <span>Port:</span>
                <span><strong>${app.port}</strong></span>
              </div>
              <div class="app-info-row">
                <span>Status:</span>
                <span class="app-status status-${app.status}">${app.status}</span>
              </div>
            </div>
            <a href="${app.url}" class="app-link" target="_blank">
              Open App →
            </a>
          </div>
        `).join('')}
      </div>
    `}
  </div>
</body>
</html>`;
  
  return c.html(html);
}

export const proxyRoute = app;
