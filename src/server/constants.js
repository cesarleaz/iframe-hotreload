// Server configuration constants

export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// Ports
export const DEFAULT_MAIN_SERVER_PORT = IS_DEVELOPMENT ? 8100 : 9100;
export const DEFAULT_RUNTIME_BASE_PORT = IS_DEVELOPMENT ? 8200 : 9200;

// Domains
export const LOCALHOST_DOMAIN = 'localhost';
export const LOOPBACK_DOMAIN = 'app.local'; // Alternative for browsers without localhost subdomain support
export const ALLOWED_DOMAINS = [LOCALHOST_DOMAIN, LOOPBACK_DOMAIN];

// Paths
export const SYSTEM_API_PATH = '/_system';
export const SHIM_PATH = `${SYSTEM_API_PATH}/shim`;
export const SHIM_SCRIPT_PATH = `${SHIM_PATH}/shim.js`;
export const SHIM_IFRAME_PATH = `${SHIM_PATH}/iframe`;
export const SHIM_IFRAME_HTML_PATH = `${SHIM_IFRAME_PATH}/index.html`;
export const SHIM_IFRAME_JS_PATH = `${SHIM_IFRAME_PATH}/index.js`;

// Timeouts
export const STARTUP_TIMEOUT_MS = 60000; // 1 minute
export const INSTALL_TIMEOUT_MS = 300000; // 5 minutes

// Port management
export const MAX_PORT_ATTEMPTS = 1000;
export const PORT_RETRY_DELAY_MS = 100;
