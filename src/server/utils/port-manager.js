import { createServer } from 'http';
import { MAX_PORT_ATTEMPTS, PORT_RETRY_DELAY_MS } from '../constants.js';

/**
 * Manages port allocation for app runtimes
 */
export class PortManager {
  constructor(basePort) {
    this.basePort = basePort;
    this.allocatedPorts = new Set();
  }

  /**
   * Checks if a port is available
   */
  async isPortAvailable(port) {
    return new Promise((resolve) => {
      const server = createServer();
      
      server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          resolve(false);
        } else {
          resolve(false);
        }
      });
      
      server.once('listening', () => {
        server.close();
        resolve(true);
      });
      
      server.listen(port);
    });
  }

  /**
   * Allocates an available port
   */
  async allocatePort() {
    for (let attempt = 0; attempt < MAX_PORT_ATTEMPTS; attempt++) {
      const port = this.basePort + attempt;
      
      // Skip if already allocated
      if (this.allocatedPorts.has(port)) {
        continue;
      }
      
      // Check if port is available
      const available = await this.isPortAvailable(port);
      if (available) {
        this.allocatedPorts.add(port);
        return port;
      }
      
      // Small delay before next attempt
      await new Promise(resolve => setTimeout(resolve, PORT_RETRY_DELAY_MS));
    }
    
    throw new Error(`Failed to allocate port after ${MAX_PORT_ATTEMPTS} attempts`);
  }

  /**
   * Releases a port back to the pool
   */
  releasePort(port) {
    this.allocatedPorts.delete(port);
  }

  /**
   * Gets all allocated ports
   */
  getAllocatedPorts() {
    return Array.from(this.allocatedPorts);
  }
}
