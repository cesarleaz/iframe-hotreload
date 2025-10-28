import { Hono } from 'hono';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { SHIM_PATH, SHIM_SCRIPT_PATH, SHIM_IFRAME_PATH } from '../constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SHIM_DIR = join(__dirname, '..', '..', 'shim');

const app = new Hono();

/**
 * Serve the shim client script
 */
app.get(SHIM_SCRIPT_PATH, async (c) => {
  try {
    const shimScript = await readFile(join(SHIM_DIR, 'shim-client.js'), 'utf8');
    
    return c.text(shimScript, 200, {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-cache'
    });
  } catch (err) {
    console.error('Error loading shim script:', err);
    return c.text('// Shim script not found', 404);
  }
});

/**
 * Serve the fallback iframe HTML
 */
app.get(`${SHIM_IFRAME_PATH}/*`, async (c) => {
  try {
    const fallbackHtml = await readFile(join(SHIM_DIR, 'iframe-fallback.html'), 'utf8');
    
    return c.html(fallbackHtml, 200, {
      'Cache-Control': 'no-cache'
    });
  } catch (err) {
    console.error('Error loading fallback HTML:', err);
    return c.text('Fallback page not found', 404);
  }
});

export const shimRoute = app;
