import { ALLOWED_DOMAINS } from '../constants.js';

/**
 * Validates if a string is a valid subdomain part
 * Must be lowercase alphanumeric with hyphens, no leading/trailing hyphens
 */
export function isValidSubdomainPart(part) {
  if (!part || typeof part !== 'string') return false;
  // Must be 1-63 characters, lowercase alphanumeric and hyphens
  // Cannot start or end with hyphen
  const regex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
  return regex.test(part);
}

/**
 * Extracts subdomain from a host string
 * Returns { subdomain, domain } or null if invalid
 */
export function parseHost(host) {
  if (!host) return null;
  
  // Remove port if present
  const hostWithoutPort = host.split(':')[0];
  const parts = hostWithoutPort.split('.');
  
  // Must have at least 2 parts (subdomain.domain)
  if (parts.length < 2) return null;
  
  // Check if base domain is allowed
  const domain = parts.slice(-1)[0];
  if (!ALLOWED_DOMAINS.includes(domain)) return null;
  
  // For localhost or loopback, subdomain is everything before .localhost/.local
  const subdomain = parts.slice(0, -1).join('.');
  
  if (!isValidSubdomainPart(subdomain)) return null;
  
  return { subdomain, domain };
}

/**
 * Generates a URL for a given subdomain
 */
export function generateAppUrl(subdomain, port, domain = ALLOWED_DOMAINS[0]) {
  if (!isValidSubdomainPart(subdomain)) {
    throw new Error(`Invalid subdomain: ${subdomain}`);
  }
  return `http://${subdomain}.${domain}:${port}`;
}

/**
 * Sanitizes a folder name to be a valid subdomain
 */
export function sanitizeSubdomain(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-') // Replace invalid chars with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .slice(0, 63); // Max subdomain length
}
