import { test } from 'node:test';
import assert from 'node:assert';
import { 
  isValidSubdomainPart,
  parseHost,
  generateAppUrl,
  sanitizeSubdomain
} from '../src/server/utils/subdomain.js';

test('isValidSubdomainPart - valid subdomains', () => {
  assert.strictEqual(isValidSubdomainPart('my-app'), true);
  assert.strictEqual(isValidSubdomainPart('test123'), true);
  assert.strictEqual(isValidSubdomainPart('app-name-123'), true);
  assert.strictEqual(isValidSubdomainPart('a'), true);
  assert.strictEqual(isValidSubdomainPart('123'), true);
});

test('isValidSubdomainPart - invalid subdomains', () => {
  assert.strictEqual(isValidSubdomainPart(''), false);
  assert.strictEqual(isValidSubdomainPart('-my-app'), false);
  assert.strictEqual(isValidSubdomainPart('my-app-'), false);
  assert.strictEqual(isValidSubdomainPart('My-App'), false);
  assert.strictEqual(isValidSubdomainPart('my_app'), false);
  assert.strictEqual(isValidSubdomainPart('my.app'), false);
  assert.strictEqual(isValidSubdomainPart('my app'), false);
});

test('parseHost - valid hosts', () => {
  const result1 = parseHost('my-app.localhost');
  assert.deepStrictEqual(result1, { subdomain: 'my-app', domain: 'localhost' });
  
  const result2 = parseHost('test.localhost:9100');
  assert.deepStrictEqual(result2, { subdomain: 'test', domain: 'localhost' });
  
  const result3 = parseHost('app-123.localhost');
  assert.deepStrictEqual(result3, { subdomain: 'app-123', domain: 'localhost' });
});

test('parseHost - invalid hosts', () => {
  assert.strictEqual(parseHost('localhost'), null);
  assert.strictEqual(parseHost('my-app.invalid-domain'), null);
  assert.strictEqual(parseHost(''), null);
  assert.strictEqual(parseHost('My-App.localhost'), null);
});

test('generateAppUrl - generates correct URLs', () => {
  const url1 = generateAppUrl('my-app', 9100);
  assert.strictEqual(url1, 'http://my-app.localhost:9100');
  
  const url2 = generateAppUrl('test', 8000, 'localhost');
  assert.strictEqual(url2, 'http://test.localhost:8000');
});

test('generateAppUrl - throws on invalid subdomain', () => {
  assert.throws(() => {
    generateAppUrl('My-App', 9100);
  }, /Invalid subdomain/);
  
  assert.throws(() => {
    generateAppUrl('-invalid', 9100);
  }, /Invalid subdomain/);
});

test('sanitizeSubdomain - sanitizes correctly', () => {
  assert.strictEqual(sanitizeSubdomain('My App'), 'my-app');
  assert.strictEqual(sanitizeSubdomain('test_app'), 'test-app');
  assert.strictEqual(sanitizeSubdomain('App#123'), 'app-123');
  assert.strictEqual(sanitizeSubdomain('-leading-trailing-'), 'leading-trailing');
  assert.strictEqual(sanitizeSubdomain('multiple---hyphens'), 'multiple-hyphens');
});

test('sanitizeSubdomain - handles long names', () => {
  const longName = 'a'.repeat(100);
  const sanitized = sanitizeSubdomain(longName);
  assert.strictEqual(sanitized.length, 63);
});

console.log('✅ All subdomain tests passed!');
