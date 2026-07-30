# Guía para Extender las Reglas de Detección

Esta guía explica cómo agregar nuevas reglas de detección sin modificar el `ThreatDetectorService`.

## Arquitectura

Las reglas están definidas en un único archivo:

```
src/rules/index.js
```

El `ThreatDetectorService` importa y recorre automáticamente todas las reglas definidas en este archivo. Para agregar una nueva regla, **solo necesitas modificar este archivo**.

## Estructura de una Regla

Cada regla es un objeto con la siguiente estructura:

```javascript
{
  name: "identificador-unico",           // Obligatorio. Identificador interno de la regla
  pattern: "texto-a-buscar",             // Obligatorio. Texto o expresión regular
  severity: "low" | "medium" | "high",   // Obligatorio. Nivel de gravedad
  category: "categoria",                 // Obligatorio. Categoría de la amenaza
  description: "Descripción...",         // Obligatorio. Explicación de qué detecta
  field: "path" | "userAgent" | "method", // Opcional. Campo sobre el que aplicar la regla. Default: "path"
  type: "includes" | "regex",            // Opcional. Tipo de coincidencia. Default: "includes"
}
```

### Campos

| Campo         | Obligatorio | Descripción                         | Valores                                 |
| ------------- | ----------- | ----------------------------------- | --------------------------------------- |
| `name`        | Sí          | Identificador único de la regla     | Texto sin espacios                      |
| `pattern`     | Sí          | Patrón a buscar en la solicitud     | Texto o regex                           |
| `severity`    | Sí          | Nivel de gravedad                   | `low`, `medium`, `high`                 |
| `category`    | Sí          | Categoría de la amenaza             | Texto descriptivo                       |
| `description` | Sí          | Explicación de la regla             | Texto                                   |
| `field`       | No          | Campo sobre el que aplicar la regla | `path` (default), `userAgent`, `method` |
| `type`        | No          | Tipo de coincidencia                | `includes` (default), `regex`           |

## Ejemplos

### Regla simple (coincidencia por substring)

Detecta intentos de acceso a archivos XML-RPC de WordPress:

```javascript
{
  name: "xmlrpc-access",
  pattern: "xmlrpc.php",
  severity: "medium",
  category: "wordpress",
  description: "Intento de acceso a xmlrpc.php de WordPress",
}
```

### Regla con expresión regular

Detecta posibles intentos de path traversal:

```javascript
{
  name: "path-traversal",
  pattern: "(\\.\\./|\\.\\.\\\\)",
  severity: "high",
  category: "path-traversal",
  description: "Detecta intentos de path traversal (../)",
  type: "regex",
}
```

### Regla sobre User-Agent

Detecta herramientas de scraping específicas:

```javascript
{
  name: "scrapy-bot",
  pattern: "Scrapy|scraper|data-miner",
  severity: "medium",
  category: "scanner",
  description: "User-Agent de herramienta de scraping",
  field: "userAgent",
  type: "regex",
}
```

### Regla sobre método HTTP

Detecta el uso de métodos HTTP peligrosos:

```javascript
{
  name: "put-method",
  pattern: "PUT",
  severity: "high",
  category: "suspicious-method",
  description: "Uso del método PUT (posible intento de subida de archivos)",
  field: "method",
}
```

## Cómo Agregar una Nueva Regla

1. Abre `src/rules/index.js`.
2. Localiza el array `rules`.
3. Agrega un nuevo objeto al array con la estructura descrita.
4. Guarda el archivo. El detector cargará automáticamente la nueva regla.

**Importante:** La primera regla que coincida determinará la clasificación. Las reglas se evalúan en el orden en que aparecen en el array.

## Buenas Prácticas

- Usa `type: "regex"` solo cuando sea necesario (las reglas `includes` son más rápidas).
- Agrupa reglas relacionadas con comentarios (ej: `// --- WordPress ---`).
- Usa las constantes `SEVERITY` y `CATEGORY` para mantener consistencia.
- No elimines reglas existentes a menos que estés seguro de que no se necesitan.

## Ejemplo Completo

```javascript
// --- Nuevas reglas personalizadas ---
{
  name: "jenkins-access",
  pattern: "jenkins",
  severity: "high",
  category: "ci-cd",
  description: "Intento de acceso a Jenkins CI/CD",
},
{
  name: "docker-access",
  pattern: "docker",
  severity: "high",
  category: "container",
  description: "Intento de acceso a rutas de Docker",
},
{
  name: "kubernetes-access",
  pattern: "kube|kubernetes",
  severity: "high",
  category: "orchestrator",
  description: "Intento de acceso a rutas de Kubernetes",
  type: "regex",
},
```

## Limitaciones Actuales

- Las reglas no soportan lógica condicional (AND/OR).
- No se pueden definir reglas dependientes del estado (ej: "si ocurre X, luego detectar Y").
- Para funcionalidades avanzadas, se puede extender el `ThreatDetectorService`.
