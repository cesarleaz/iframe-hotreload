import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { AppManager } from './app-manager.js';
import { shimRoute } from './routes/shim.js';
import { proxyRoute } from './routes/proxy.js';
import { setupWebSocketProxy } from './websocket-proxy.js';
import { DEFAULT_MAIN_SERVER_PORT } from './constants.js';

const PORT = process.env.PORT || DEFAULT_MAIN_SERVER_PORT;

async function main() {
  console.log('🚀 Starting Iframe Hot-Reload System...\n');
  
  // Initialize app manager
  const appManager = new AppManager();
  appManager.setMainServerPort(PORT);
  
  // Scan for apps in the apps directory
  console.log('📁 Scanning for apps...');
  const apps = await appManager.scanAppsDirectory();
  
  if (apps.length > 0) {
    console.log(`✅ Found ${apps.length} app(s):\n`);
    apps.forEach(app => {
      console.log(`   • ${app.name}`);
      console.log(`     URL: ${app.url}`);
      console.log(`     Port: ${app.port}`);
      console.log(`     Path: ${app.path}\n`);
    });
  } else {
    console.log('ℹ️  No apps found in apps/ directory\n');
    console.log('   To create an app:');
    console.log('   1. Create a directory in apps/');
    console.log('   2. Add your app code (HTML, Vite project, etc.)');
    console.log('   3. Start your app dev server on the assigned port\n');
  }
  
  // Create Hono app
  const app = new Hono();
  
  // Add app manager to context
  app.use('*', async (c, next) => {
    c.set('appManager', appManager);
    await next();
  });
  
  // Mount routes
  app.route('/', shimRoute);
  app.route('/', proxyRoute); // Must be last - catch-all proxy
  
  // Start HTTP server
  const server = serve({
    fetch: app.fetch,
    port: PORT
  });
  
  // Setup WebSocket proxy for HMR
  setupWebSocketProxy(server, appManager);
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (apps.length > 0) {
    console.log('🌐 Access your apps at:');
    apps.forEach(app => {
      console.log(`   ${app.url}`);
    });
    console.log('');
  }
  
  console.log('💡 View all apps: http://localhost:' + PORT);
  console.log('⏹️  Press Ctrl+C to stop\n');
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n⏹️  Shutting down server...');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n\n⏹️  Shutting down server...');
    process.exit(0);
  });
}

main().catch(err => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
