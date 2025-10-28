/**
 * Shim Client - Injected into app HTML
 * Captures console logs and communicates with parent window
 */

// Store original console methods
const originalConsole = {
  log: console.log.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  info: console.info.bind(console),
  debug: console.debug.bind(console)
};

/**
 * Formats arguments for transmission
 */
function formatArgs(args) {
  return args.map(arg => {
    if (arg instanceof Error) {
      return `${arg.name}: ${arg.message}${arg.stack ? '\n' + arg.stack : ''}`;
    }
    if (typeof arg === 'string') {
      return arg;
    }
    if (typeof arg === 'object' && arg !== null) {
      try {
        return JSON.stringify(arg, null, 2);
      } catch {
        return '[Unserializable object]';
      }
    }
    return String(arg);
  }).join(' ');
}

/**
 * Sends console log to parent window
 */
function sendConsoleLog(type, args) {
  try {
    const message = formatArgs(args);
    window.parent.postMessage({
      type: 'console-log',
      value: { message, type }
    }, '*');
  } catch (err) {
    originalConsole.error('Failed to send console log:', err);
  }
}

/**
 * Intercept console methods
 */
function interceptConsole(methodName) {
  console[methodName] = function(...args) {
    originalConsole[methodName](...args);
    sendConsoleLog(methodName, args);
  };
}

// Intercept all console methods
['log', 'warn', 'error', 'info', 'debug'].forEach(interceptConsole);

/**
 * Capture uncaught errors
 */
window.addEventListener('error', (event) => {
  const error = event.error instanceof Error 
    ? event.error 
    : new Error(event.message);
  
  const message = error.stack || `${error.name}: ${error.message}`;
  
  window.parent.postMessage({
    type: 'console-log',
    value: { 
      message: `Uncaught ${message}`, 
      type: 'error' 
    }
  }, '*');
});

/**
 * Capture unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason instanceof Error
    ? event.reason
    : new Error(String(event.reason));
  
  const message = error.stack || `${error.name}: ${error.message}`;
  
  window.parent.postMessage({
    type: 'console-log',
    value: { 
      message: `Unhandled Promise Rejection: ${message}`, 
      type: 'error' 
    }
  }, '*');
});

/**
 * Send notification before page unload (for hot reload)
 */
window.addEventListener('beforeunload', () => {
  try {
    window.parent.postMessage({
      type: 'will-reload'
    }, '*');
  } catch {
    // Ignore errors during unload
  }
});

/**
 * Listen for messages from parent
 */
window.addEventListener('message', (event) => {
  if (!event.data || typeof event.data !== 'object') return;
  
  const { type } = event.data;
  
  switch (type) {
    case 'reload-window':
      window.location.reload();
      break;
    case 'history-back':
      window.history.back();
      break;
    case 'history-forward':
      window.history.forward();
      break;
  }
});

// Log that shim is loaded
originalConsole.log('[Shim] Console capture enabled');
