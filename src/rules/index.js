/**
 * Módulo de reglas de detección configurables.
 *
 * Este módulo centraliza la definición de reglas que el ThreatDetectorService
 * recorrerá automáticamente para determinar si una solicitud es sospechosa.
 *
 * Las reglas NO están hardcodeadas en el detector, sino que se definen aquí
 * como una lista de objetos configurables. Esto permite agregar, modificar
 * o eliminar reglas sin tocar el detector.
 *
 * Cómo agregar una nueva regla:
 *   Simplemente agregar un nuevo objeto al array "rules" con la siguiente estructura:
 *   {
 *     name: "nombre-unico-de-la-regla",       // Identificador interno
 *     pattern: "texto-a-buscar-en-la-url",     // Texto o regex a buscar (case-insensitive)
 *     severity: "low" | "medium" | "high",     // Nivel de gravedad
 *     category: "categoria",                   // Categoría de la amenaza
 *     description: "Descripción de la regla",  // Explicación de qué detecta
 *     field: "path" | "userAgent" | "method",  // (Opcional) Campo sobre el que aplicar la regla. Por defecto "path"
 *     type: "includes" | "regex",              // (Opcional) Tipo de coincidencia. Por defecto "includes"
 *   }
 *
 * Ejemplo:
 *   {
 *     name: "detect-sql-injection",
 *     pattern: "union select|select.*from|insert into|drop table",
 *     severity: "high",
 *     category: "sql-injection",
 *     description: "Detecta posibles intentos de inyección SQL",
 *     type: "regex",
 *   }
 */

import { SEVERITY, CATEGORY } from "../constants/index.js";

/**
 * Lista maestra de reglas de detección.
 * El ThreatDetectorService recorrerá este array secuencialmente.
 * La primera regla que coincida determinará la clasificación del evento.
 * Si ninguna regla coincide, el evento NO se considera sospechoso.
 */
const rules = [
  // --- Archivos y directorios sensibles (HIGH) ---
  {
    name: "dotenv-access",
    pattern: ".env",
    severity: SEVERITY.HIGH,
    category: CATEGORY.DOTENV,
    description: "Intento de acceso al archivo .env con credenciales",
  },
  {
    name: "git-access",
    pattern: ".git",
    severity: SEVERITY.HIGH,
    category: CATEGORY.GIT,
    description: "Intento de acceso al directorio .git",
  },
  {
    name: "svn-access",
    pattern: ".svn",
    severity: SEVERITY.HIGH,
    category: CATEGORY.SVN,
    description: "Intento de acceso al directorio .svn (Subversion)",
  },
  {
    name: "hg-access",
    pattern: ".hg",
    severity: SEVERITY.HIGH,
    category: CATEGORY.HG,
    description: "Intento de acceso al directorio .hg (Mercurial)",
  },
  {
    name: "phpmyadmin-access",
    pattern: "phpmyadmin",
    severity: SEVERITY.HIGH,
    category: CATEGORY.PHPMYADMIN,
    description: "Intento de acceso a phpMyAdmin",
  },
  {
    name: "wp-admin-access",
    pattern: "wp-admin",
    severity: SEVERITY.HIGH,
    category: CATEGORY.WP_ADMIN,
    description: "Intento de acceso al panel de administración de WordPress",
  },
  {
    name: "wp-login-access",
    pattern: "wp-login",
    severity: SEVERITY.HIGH,
    category: CATEGORY.WP_LOGIN,
    description: "Intento de acceso al login de WordPress",
  },
  {
    name: "wp-content-access",
    pattern: "wp-content",
    severity: SEVERITY.HIGH,
    category: CATEGORY.WP_CONTENT,
    description: "Intento de acceso a contenido de WordPress",
  },
  {
    name: "actuator-access",
    pattern: "actuator",
    severity: SEVERITY.HIGH,
    category: CATEGORY.ACTUATOR,
    description: "Intento de acceso a Spring Actuator",
  },
  {
    name: "aws-credentials",
    pattern: ".aws",
    severity: SEVERITY.HIGH,
    category: CATEGORY.AWS,
    description: "Intento de acceso a credenciales AWS",
  },
  {
    name: "vendor-access",
    pattern: "vendor",
    severity: SEVERITY.HIGH,
    category: CATEGORY.VENDOR,
    description: "Intento de acceso al directorio vendor (PHP)",
  },
  {
    name: "vscode-access",
    pattern: ".vscode",
    severity: SEVERITY.MEDIUM,
    category: CATEGORY.VSCODE,
    description: "Intento de acceso a configuración de VS Code",
  },
  {
    name: "ds-store-access",
    pattern: ".DS_Store",
    severity: SEVERITY.LOW,
    category: CATEGORY.DS_STORE,
    description: "Intento de acceso al archivo .DS_Store de macOS",
  },

  // --- Archivos de configuración y administración (MEDIUM) ---
  {
    name: "phpinfo-access",
    pattern: "phpinfo",
    severity: SEVERITY.MEDIUM,
    category: CATEGORY.PHPINFO,
    description: "Intento de acceso a phpinfo()",
  },
  {
    name: "info-php-access",
    pattern: "info.php",
    severity: SEVERITY.MEDIUM,
    category: CATEGORY.PHPINFO,
    description: "Intento de acceso a info.php",
  },
  {
    name: "config-php-access",
    pattern: "config.php",
    severity: SEVERITY.MEDIUM,
    category: CATEGORY.CONFIG,
    description: "Intento de acceso a archivo de configuración PHP",
  },
  {
    name: "database-access",
    pattern: "database",
    severity: SEVERITY.MEDIUM,
    category: CATEGORY.DATABASE,
    description: "Intento de acceso a ruta relacionada con base de datos",
  },
  {
    name: "backup-access",
    pattern: "backup",
    severity: SEVERITY.MEDIUM,
    category: CATEGORY.BACKUP,
    description: "Intento de acceso a archivos de backup",
  },
  {
    name: "dump-access",
    pattern: "dump",
    severity: SEVERITY.MEDIUM,
    category: CATEGORY.BACKUP,
    description: "Intento de acceso a dumps de base de datos",
  },
  {
    name: "admin-access",
    pattern: "admin",
    severity: SEVERITY.MEDIUM,
    category: CATEGORY.ADMIN,
    description: "Intento de acceso a panel de administración",
  },
  {
    name: "graphql-access",
    pattern: "graphql",
    severity: SEVERITY.MEDIUM,
    category: CATEGORY.GRAPHQL,
    description: "Intento de acceso a endpoint GraphQL",
  },

  // --- Métodos HTTP sospechosos ---
  {
    name: "trace-method",
    pattern: "TRACE",
    severity: SEVERITY.MEDIUM,
    category: CATEGORY.METHOD_SUSPICIOUS,
    description:
      "Uso del método HTTP TRACE (posible ataque de cross-site tracing)",
    field: "method",
  },
  {
    name: "connect-method",
    pattern: "CONNECT",
    severity: SEVERITY.MEDIUM,
    category: CATEGORY.METHOD_SUSPICIOUS,
    description: "Uso del método HTTP CONNECT (posible túnel proxy)",
    field: "method",
  },

  // --- User-Agent scanner ---
  {
    name: "known-scanner",
    pattern:
      "acunetix|nmap|sqlmap|nikto|openvas|nessus|burp|zap|wpscan|dirbuster|gobuster|hydra|masscan|whatweb|w3af|netsparker",
    severity: SEVERITY.HIGH,
    category: CATEGORY.SCANNER,
    description: "User-Agent perteneciente a un scanner de seguridad conocido",
    field: "userAgent",
    type: "regex",
  },
  {
    name: "empty-user-agent",
    pattern: "^$",
    severity: SEVERITY.LOW,
    category: CATEGORY.EMPTY_UA,
    description: "User-Agent vacío (posible herramienta automatizada)",
    field: "userAgent",
    type: "regex",
  },
];

export default rules;
