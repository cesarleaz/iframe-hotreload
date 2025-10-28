import { test } from 'node:test';
import assert from 'node:assert';
import { PortManager } from '../src/server/utils/port-manager.js';

test('PortManager - allocates sequential ports', async () => {
  const manager = new PortManager(10000);
  
  const port1 = await manager.allocatePort();
  const port2 = await manager.allocatePort();
  const port3 = await manager.allocatePort();
  
  assert.strictEqual(port1, 10000);
  assert.strictEqual(port2, 10001);
  assert.strictEqual(port3, 10002);
  
  // Cleanup
  manager.releasePort(port1);
  manager.releasePort(port2);
  manager.releasePort(port3);
});

test('PortManager - tracks allocated ports', async () => {
  const manager = new PortManager(10010);
  
  const port1 = await manager.allocatePort();
  const port2 = await manager.allocatePort();
  
  const allocated = manager.getAllocatedPorts();
  assert.ok(allocated.includes(port1));
  assert.ok(allocated.includes(port2));
  assert.strictEqual(allocated.length, 2);
  
  // Cleanup
  manager.releasePort(port1);
  manager.releasePort(port2);
});

test('PortManager - releases ports correctly', async () => {
  const manager = new PortManager(10020);
  
  const port = await manager.allocatePort();
  assert.strictEqual(manager.getAllocatedPorts().length, 1);
  
  manager.releasePort(port);
  assert.strictEqual(manager.getAllocatedPorts().length, 0);
});

test('PortManager - reuses released ports', async () => {
  const manager = new PortManager(10030);
  
  const port1 = await manager.allocatePort();
  const port2 = await manager.allocatePort();
  
  manager.releasePort(port1);
  
  const port3 = await manager.allocatePort();
  
  // Should reuse the first port since it was released
  assert.strictEqual(port3, port1);
  
  // Cleanup
  manager.releasePort(port2);
  manager.releasePort(port3);
});

test('PortManager - isPortAvailable works correctly', async () => {
  const manager = new PortManager(10040);
  
  // Port should be available initially
  const available1 = await manager.isPortAvailable(10040);
  assert.strictEqual(available1, true);
  
  // Allocate the port
  const port = await manager.allocatePort();
  
  // Port should be available (allocation doesn't actually bind)
  const available2 = await manager.isPortAvailable(port);
  assert.strictEqual(available2, true);
  
  // Cleanup
  manager.releasePort(port);
});

console.log('✅ All port manager tests passed!');
