/**
 * Constantes del sistema.
 *
 * Centraliza valores fijos como severidades, categorías, listas de
 * scanners conocidos y headers que deben filtrarse por seguridad.
 *
 * Punto de extensión:
 *   Agregar aquí nuevos scanners, categorías o severidades conforme
 *   evolucione el sistema de detección.
 */

/** Niveles de severidad ordenados de mayor a menor gravedad */
export const SEVERITY = Object.freeze({
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
});

/** Categorías de amenazas detectadas */
export const CATEGORY = Object.freeze({
  DOTENV: "dotenv",
  GIT: "git",
  SVN: "svn",
  HG: "hg",
  WP_ADMIN: "wp-admin",
  WP_LOGIN: "wp-login",
  WP_CONTENT: "wp-content",
  PHPMYADMIN: "phpmyadmin",
  PHPINFO: "phpinfo",
  ACTUATOR: "actuator",
  GRAPHQL: "graphql",
  VENDOR: "vendor",
  AWS: "aws",
  VSCODE: "vscode",
  DS_STORE: "ds_store",
  ADMIN: "admin",
  BACKUP: "backup",
  CONFIG: "config",
  DATABASE: "database",
  SCANNER: "scanner",
  EMPTY_UA: "empty-user-agent",
  METHOD_SUSPICIOUS: "suspicious-method",
  NOT_FOUND: "not-found",
  UNKNOWN: "unknown",
});

/** Headers que deben filtrarse antes de almacenar por seguridad */
export const SENSITIVE_HEADERS = Object.freeze([
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "api-key",
  "token",
  "x-auth-token",
  "password",
  "secret",
]);

/** User-Agents conocidos de scanners y bots maliciosos */
export const KNOWN_SCANNERS = Object.freeze([
  "acunetix",
  "nmap",
  "sqlmap",
  "nikto",
  "openvas",
  "nessus",
  "burp",
  "zap",
  "wpscan",
  "dirbuster",
  "gobuster",
  "hydra",
  "medusa",
  "aircrack",
  "metasploit",
  "masscan",
  "whatweb",
  "w3af",
  "netsparker",
  "appscan",
  "webinspect",
  "qualys",
  "arachni",
  "vega",
  "ironwasp",
  "skipfish",
  "ratproxy",
  "paros",
  "webfuzzer",
  "fuzz",
  "scan",
  "crawler",
  "spider",
  "bot",
  "curl",
  "wget",
  "python-requests",
  "python-urllib",
  "go-http-client",
  "java",
  "ruby",
  "perl",
  "libwww",
  "scrapy",
  "httpclient",
]);

/** Métodos HTTP sospechosos que no deberían usarse en producción */
export const SUSPICIOUS_METHODS = Object.freeze(["TRACE", "CONNECT"]);

/** Rutas conocidas de ataques con severidad HIGH */
export const HIGH_SEVERITY_PATTERNS = Object.freeze([
  ".env",
  ".git",
  "phpmyadmin",
  "wp-admin",
  "wp-login",
  "actuator",
  ".aws",
  "vendor",
]);

/** Rutas conocidas de ataques con severidad MEDIUM */
export const MEDIUM_SEVERITY_PATTERNS = Object.freeze([
  "graphql",
  "admin",
  "backup",
  "config",
  "phpinfo",
  "info.php",
]);
