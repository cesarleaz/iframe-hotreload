import { test } from 'node:test';
import assert from 'node:assert';
import { AppManager } from '../src/server/app-manager.js';

test('AppManager - registers app correctly', async () => {
  const manager = new AppManager();
  
  const app = await manager.registerApp({
    subdomain: 'test-app',
    name: 'Test App',
    port: 9200,
    path: '/path/to/app'
  });
  
  assert.strictEqual(app.subdomain, 'test-app');
  assert.strictEqual(app.name, 'Test App');
  assert.strictEqual(app.port, 9200);
  assert.strictEqual(app.status, 'registered');
  assert.ok(app.url.includes('test-app'));
});

test('AppManager - prevents duplicate subdomains', async () => {
  const manager = new AppManager();
  
  await manager.registerApp({
    subdomain: 'duplicate',
    name: 'First',
    port: 9200,
    path: '/path1'
  });
  
  await assert.rejects(
    async () => {
      await manager.registerApp({
        subdomain: 'duplicate',
        name: 'Second',
        port: 9201,
        path: '/path2'
      });
    },
    /already exists/
  );
});

test('AppManager - gets app by subdomain', async () => {
  const manager = new AppManager();
  
  await manager.registerApp({
    subdomain: 'findme',
    name: 'Find Me',
    port: 9200,
    path: '/path'
  });
  
  const app = manager.getApp('findme');
  assert.ok(app);
  assert.strictEqual(app.subdomain, 'findme');
  assert.strictEqual(app.name, 'Find Me');
  
  const notFound = manager.getApp('nonexistent');
  assert.strictEqual(notFound, undefined);
});

test('AppManager - gets all apps', async () => {
  const manager = new AppManager();
  
  await manager.registerApp({
    subdomain: 'app1',
    name: 'App 1',
    port: 9200,
    path: '/path1'
  });
  
  await manager.registerApp({
    subdomain: 'app2',
    name: 'App 2',
    port: 9201,
    path: '/path2'
  });
  
  const apps = manager.getAllApps();
  assert.strictEqual(apps.length, 2);
  assert.ok(apps.some(app => app.subdomain === 'app1'));
  assert.ok(apps.some(app => app.subdomain === 'app2'));
});

test('AppManager - updates app status', async () => {
  const manager = new AppManager();
  
  await manager.registerApp({
    subdomain: 'status-test',
    name: 'Status Test',
    port: 9200,
    path: '/path'
  });
  
  manager.updateAppStatus('status-test', 'running');
  
  const app = manager.getApp('status-test');
  assert.strictEqual(app.status, 'running');
});

test('AppManager - removes app', async () => {
  const manager = new AppManager();
  
  await manager.registerApp({
    subdomain: 'removeme',
    name: 'Remove Me',
    port: 9200,
    path: '/path'
  });
  
  assert.ok(manager.getApp('removeme'));
  
  manager.removeApp('removeme');
  
  assert.strictEqual(manager.getApp('removeme'), undefined);
});

test('AppManager - creates app with auto port', async () => {
  const manager = new AppManager();
  
  const app = await manager.createApp('auto-port', 'Auto Port App');
  
  assert.ok(app.port >= manager.portManager.basePort);
  assert.strictEqual(app.subdomain, 'auto-port');
  
  // Port should be allocated
  const allocated = manager.portManager.getAllocatedPorts();
  assert.ok(allocated.includes(app.port));
});

console.log('✅ All app manager tests passed!');
