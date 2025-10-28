import { WebSocketServer, WebSocket } from 'ws';
import { parseHost } from './utils/subdomain.js';

/**
 * Sets up WebSocket proxy for HMR (Hot Module Replacement)
 * This allows Vite's HMR to work through the proxy
 */
export function setupWebSocketProxy(server, appManager) {
  const wss = new WebSocketServer({ noServer: true });
  
  server.on('upgrade', (request, socket, head) => {
    const host = request.headers.host || '';
    const hostInfo = parseHost(host);
    
    if (!hostInfo) {
      socket.destroy();
      return;
    }
    
    const { subdomain } = hostInfo;
    const app = appManager.getApp(subdomain);
    
    if (!app) {
      socket.destroy();
      return;
    }
    
    // Connect to the app's WebSocket server
    const targetUrl = `ws://localhost:${app.port}${request.url}`;
    const targetWs = new WebSocket(targetUrl, {
      headers: request.headers
    });
    
    wss.handleUpgrade(request, socket, head, (clientWs) => {
      // Proxy messages between client and target
      clientWs.on('message', (data) => {
        if (targetWs.readyState === WebSocket.OPEN) {
          targetWs.send(data);
        }
      });
      
      targetWs.on('message', (data) => {
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(data);
        }
      });
      
      // Handle errors and close events
      clientWs.on('error', (err) => {
        console.error('Client WebSocket error:', err);
        targetWs.close();
      });
      
      targetWs.on('error', (err) => {
        console.error('Target WebSocket error:', err);
        clientWs.close();
      });
      
      clientWs.on('close', () => {
        targetWs.close();
      });
      
      targetWs.on('close', () => {
        clientWs.close();
      });
    });
  });
  
  return wss;
}
