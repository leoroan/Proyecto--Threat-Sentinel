# Documentación de la API REST de Threat Sentinel

## Base URL

```
http://localhost:3000
```

## Health Check

### GET /health

Verifica que el servicio esté funcionando y que la conexión a MongoDB esté activa.

**Response 200 (OK):**

```json
{
  "status": "ok",
  "database": "connected"
}
```

**Response 200 (Degradado):**

```json
{
  "status": "degraded",
  "database": "disconnected"
}
```

---

## Eventos

### POST /api/events

Registra un nuevo evento de amenaza. Solo se almacenan eventos considerados sospechosos por el sistema de detección.

**Request Body:**

```json
{
  "ip": "192.168.1.100",
  "method": "GET",
  "path": "/.env",
  "originalUrl": "/.env",
  "query": {},
  "headers": {
    "user-agent": "Mozilla/5.0",
    "host": "example.com"
  },
  "userAgent": "Mozilla/5.0",
  "referer": "",
  "host": "example.com",
  "protocol": "http",
  "httpVersion": "1.1",
  "responseStatus": 404,
  "sourceApplication": "my-api",
  "notes": "Intento sospechoso"
}
```

**Response 201 Created:**

```json
{
  "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
  "ip": "192.168.1.100",
  "method": "GET",
  "path": "/.env",
  "originalUrl": "/.env",
  "query": {},
  "headers": {
    "user-agent": "Mozilla/5.0",
    "host": "example.com"
  },
  "userAgent": "Mozilla/5.0",
  "referer": "",
  "host": "example.com",
  "protocol": "http",
  "httpVersion": "1.1",
  "responseStatus": 404,
  "sourceApplication": "my-api",
  "severity": "high",
  "category": "dotenv",
  "matchedRule": "dotenv-access",
  "reason": "Intento de acceso al archivo .env con credenciales",
  "notes": "Intento sospechoso",
  "createdAt": "2024-01-12T10:30:00.000Z",
  "updatedAt": "2024-01-12T10:30:00.000Z"
}
```

**Response 422 Unprocessable Entity:**

```json
{
  "error": {
    "code": "NOT_SUSPICIOUS",
    "message": "El evento no se considera sospechoso"
  }
}
```

---

### GET /api/events

Lista eventos con paginación y filtros.

**Query Parameters:**

| Parámetro         | Tipo              | Descripción                                                     | Default   |
| ----------------- | ----------------- | --------------------------------------------------------------- | --------- |
| page              | number            | Número de página                                                | 1         |
| limit             | number            | Elementos por página (max 100)                                  | 20        |
| sort              | string            | Campo de ordenamiento (createdAt, ip, severity, category, path) | createdAt |
| order             | string            | Dirección (asc, desc)                                           | desc      |
| severity          | string            | Filtrar por severidad (low, medium, high)                       | -         |
| category          | string            | Filtrar por categoría                                           | -         |
| ip                | string            | Filtrar por IP                                                  | -         |
| sourceApplication | string            | Filtrar por aplicación origen                                   | -         |
| desde             | string (ISO date) | Fecha de inicio                                                 | -         |
| hasta             | string (ISO date) | Fecha de fin                                                    | -         |

**Response 200:**

```json
{
  "events": [
    {
      "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
      "ip": "192.168.1.100",
      "method": "GET",
      "path": "/.env",
      "severity": "high",
      "category": "dotenv",
      "matchedRule": "dotenv-access",
      "createdAt": "2024-01-12T10:30:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "totalPages": 1
}
```

---

### GET /api/events/:id

Obtiene el detalle completo de un evento.

**Response 200:**

```json
{
  "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
  "ip": "192.168.1.100",
  "method": "GET",
  "path": "/.env",
  "originalUrl": "/.env",
  "query": {},
  "headers": { "user-agent": "Mozilla/5.0", "host": "example.com" },
  "userAgent": "Mozilla/5.0",
  "referer": "",
  "host": "example.com",
  "protocol": "http",
  "httpVersion": "1.1",
  "responseStatus": 404,
  "sourceApplication": "my-api",
  "severity": "high",
  "category": "dotenv",
  "matchedRule": "dotenv-access",
  "reason": "Intento de acceso al archivo .env con credenciales",
  "notes": "",
  "createdAt": "2024-01-12T10:30:00.000Z",
  "updatedAt": "2024-01-12T10:30:00.000Z"
}
```

**Response 404:**

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Evento no encontrado"
  }
}
```

---

### DELETE /api/events/:id

Elimina un evento por su ID.

**Response 200:**

```json
{
  "message": "Evento eliminado correctamente",
  "event": {
    "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
    "ip": "192.168.1.100",
    "method": "GET",
    "path": "/.env",
    "severity": "high",
    "category": "dotenv",
    "matchedRule": "dotenv-access",
    "createdAt": "2024-01-12T10:30:00.000Z",
    "updatedAt": "2024-01-12T10:30:00.000Z"
  }
}
```

---

## Estadísticas

### GET /api/stats

Obtiene estadísticas agregadas de los eventos almacenados.

**Response 200:**

```json
{
  "totalEventos": 150,
  "eventosHoy": 12,
  "eventosUltimaHora": 3,
  "topIPs": [
    { "ip": "192.168.1.100", "count": 45 },
    { "ip": "10.0.0.1", "count": 30 }
  ],
  "topPaths": [
    { "path": "/.env", "count": 40 },
    { "path": "/wp-admin", "count": 25 }
  ],
  "topUserAgents": [
    { "userAgent": "python-requests", "count": 60 },
    { "userAgent": "Mozilla/5.0", "count": 30 }
  ],
  "topCategorias": [
    { "category": "dotenv", "count": 40 },
    { "category": "scanner", "count": 35 }
  ],
  "topAplicaciones": [
    { "sourceApplication": "my-api", "count": 100 },
    { "sourceApplication": "other-api", "count": 50 }
  ]
}
```

---

## Códigos de Error

| Código              | HTTP Status | Descripción                                  |
| ------------------- | ----------- | -------------------------------------------- |
| VALIDATION_ERROR    | 400         | Error de validación de datos de entrada      |
| INVALID_ID          | 400         | El ID proporcionado no es un ObjectId válido |
| NOT_FOUND           | 404         | Recurso no encontrado                        |
| NOT_SUSPICIOUS      | 422         | El evento no se considera sospechoso         |
| RATE_LIMIT_EXCEEDED | 429         | Demasiadas solicitudes                       |
| INTERNAL_ERROR      | 500         | Error interno del servidor                   |
