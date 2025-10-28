import { readdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { PortManager } from './utils/port-manager.js';
import { sanitizeSubdomain, generateAppUrl } from './utils/subdomain.js';
import { DEFAULT_RUNTIME_BASE_PORT, DEFAULT_MAIN_SERVER_PORT } from './constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..', '..');

/**
 * Manages app registration, lifecycle, and port allocation
 */
export class AppManager {
  constructor() {
    this.apps = new Map(); // subdomain -> app config
    this.portManager = new PortManager(DEFAULT_RUNTIME_BASE_PORT);
    this.mainServerPort = DEFAULT_MAIN_SERVER_PORT;
  }

  /**
   * Sets the main server port
   */
  setMainServerPort(port) {
    this.mainServerPort = port;
  }

  /**
   * Registers a new app
   */
  async registerApp(config) {
    const { subdomain, name, port, path } = config;
    
    if (this.apps.has(subdomain)) {
      throw new Error(`App with subdomain '${subdomain}' already exists`);
    }

    const app = {
      subdomain,
      name: name || subdomain,
      port,
      path,
      status: 'registered',
      url: generateAppUrl(subdomain, this.mainServerPort),
      proxyTarget: `http://localhost:${port}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.apps.set(subdomain, app);
    return app;
  }

  /**
   * Scans the apps directory and registers all found apps
   */
  async scanAppsDirectory() {
    const appsDir = join(PROJECT_ROOT, 'apps');
    
    try {
      const entries = await readdir(appsDir, { withFileTypes: true });
      const apps = [];
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const subdomain = sanitizeSubdomain(entry.name);
          
          // Skip if already registered
          if (this.apps.has(subdomain)) {
            continue;
          }
          
          // Allocate a port for this app
          const port = await this.portManager.allocatePort();
          
          const app = await this.registerApp({
            subdomain,
            name: entry.name,
            port,
            path: join(appsDir, entry.name)
          });
          
          apps.push(app);
        }
      }
      
      return apps;
    } catch (err) {
      // Apps directory doesn't exist yet
      if (err.code === 'ENOENT') {
        console.log('Apps directory not found, skipping scan');
        return [];
      }
      throw err;
    }
  }

  /**
   * Gets an app by subdomain
   */
  getApp(subdomain) {
    return this.apps.get(subdomain);
  }

  /**
   * Gets all registered apps
   */
  getAllApps() {
    return Array.from(this.apps.values());
  }

  /**
   * Updates app status
   */
  updateAppStatus(subdomain, status) {
    const app = this.apps.get(subdomain);
    if (app) {
      app.status = status;
      app.updatedAt = new Date();
    }
  }

  /**
   * Removes an app
   */
  removeApp(subdomain) {
    const app = this.apps.get(subdomain);
    if (app) {
      this.portManager.releasePort(app.port);
      this.apps.delete(subdomain);
    }
  }

  /**
   * Creates a new app with auto-generated port
   */
  async createApp(subdomain, name) {
    const port = await this.portManager.allocatePort();
    return this.registerApp({
      subdomain,
      name,
      port,
      path: join(PROJECT_ROOT, 'apps', subdomain)
    });
  }
}
