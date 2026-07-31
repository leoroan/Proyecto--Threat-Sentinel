# Threat Sentinel 🛡️

Microservicio REST para detectar, clasificar, almacenar y exponer información sobre intentos de acceso sospechosos, scanners automáticos, bots y posibles ataques recibidos por uno o varios servicios.

## Objetivo

Construir una base sólida para evolucionar posteriormente hacia un sistema de detección de intrusiones (IDS). El proyecto está diseñado como un **microservicio independiente** para que cualquier backend (Node.js, Java, .NET, Python, etc.) pueda enviar eventos para su análisis y almacenamiento.

## Stack Tecnológico

- **Node.js LTS** (v18+)
- **ECMAScript Modules** (ESM)
- **Express 5**
- **MongoDB** + **Mongoose**
- **Joi** (validaciones)
- **Helmet**, **CORS**, **Rate Limiting** (seguridad)

## Arquitectura

```
src/
├── config/          # Configuración centralizada (.env)
├── constants/       # Constantes del sistema (severidades, categorías, scanners)
├── controllers/     # Capa de control HTTP
├── detectors/       # Sistema de detección de amenazas
├── middlewares/      # Middlewares (errores, validación, threat logger)
├── models/          # Modelos de Mongoose (ThreatEvent)
├── routes/          # Definición de rutas
├── services/        # Lógica de negocio (eventos, estadísticas)
├── validators/      # Esquemas de validación con Joi
├── utils/           # Utilidades generales
├── clients/         # Cliente HTTP reutilizable (ThreatLoggerClient)
├── docs/            # Documentación
├── app.js           # Configuración de Express
└── server.js        # Punto de entrada
```

### Principios Aplicados

- **SOLID**: Cada módulo tiene una responsabilidad única.
- **DRY**: La lógica se centraliza en servicios, no se repite en controladores.
- **KISS**: Diseño simple y directo, fácil de entender.
- **Separation of Concerns**: Router, Controller, Service, Model claramente separados.

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/leoroan/Proyecto--Threat-Sentinel.git
cd Proyecto--Threat-Sentinel

# Instalar dependencias
npm install

# Copiar y configurar variables de entorno
cp .env.example .env
```

## Configuración

Editar el archivo `.env` con los valores adecuados para tu entorno:

| Variable               | Descripción                      | Default                                     |
| ---------------------- | -------------------------------- | ------------------------------------------- |
| `PORT`                 | Puerto del servidor              | `3000`                                      |
| `MONGODB_URI`          | URI de conexión a MongoDB        | `mongodb://localhost:27017/threat-sentinel` |
| `SOURCE_APPLICATION`   | Nombre de la aplicación origen   | `threat-sentinel`                           |
| `CORS_ORIGINS`         | Orígenes permitidos para CORS    | `*`                                         |
| `RATE_LIMIT_WINDOW_MS` | Ventana de rate limiting (ms)    | `900000` (15 min)                           |
| `RATE_LIMIT_MAX`       | Máximo de peticiones por ventana | `100`                                       |
| `MORGAN_FORMAT`        | Formato de logging HTTP          | `dev`                                       |

## Ejecución

```bash
# Modo producción
npm start

# Modo desarrollo (con watch)
npm run dev
```

El servidor iniciará en `http://localhost:3000`.

### Health Check

```bash
curl http://localhost:3000/health
```

```json
{ "status": "ok" }
```

## Scripts npm

| Script        | Descripción                                                  |
| ------------- | ------------------------------------------------------------ |
| `npm start`   | Inicia el servidor en producción                             |
| `npm run dev` | Inicia el servidor en modo desarrollo con recarga automática |

## API

### Endpoints principales

| Método   | Ruta              | Descripción               |
| -------- | ----------------- | ------------------------- |
| `GET`    | `/health`         | Health check              |
| `POST`   | `/api/events`     | Registrar un evento       |
| `GET`    | `/api/events`     | Listar eventos (paginado) |
| `GET`    | `/api/events/:id` | Detalle de un evento      |
| `DELETE` | `/api/events/:id` | Eliminar un evento        |
| `GET`    | `/api/stats`      | Estadísticas del sistema  |

### Ejemplo: Crear un evento

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "ip": "192.168.1.100",
    "method": "GET",
    "path": "/.env",
    "originalUrl": "/.env",
    "headers": {"user-agent": "curl/8.0", "host": "example.com"},
    "responseStatus": 404,
    "sourceApplication": "mi-app"
  }'
```

## Documentación

La documentación completa se encuentra en `src/docs/`:

- **[API.md](src/docs/API.md)**: Documentación completa de la API con ejemplos.
- **[integration-guide.md](src/docs/integration-guide.md)**: Guía para integrar desde otros backends.
- **[extending-rules.md](src/docs/extending-rules.md)**: Guía para agregar nuevas reglas de detección.

## Colección Postman

Importar la colección desde `postman/ThreatSentinel.postman_collection.json` para probar todos los endpoints.

## Ejemplo de Integración

El directorio `examples/basic-express/` contiene una aplicación Express mínima que demuestra:

1. **Middleware automático**: Captura y envía eventos 4xx/5xx automáticamente.
2. **Cliente manual**: Envía eventos usando `ThreatLoggerClient`.
3. **Consulta de estadísticas**: Muestra cómo obtener métricas.

### Ejecutar el ejemplo

```bash
cd examples/basic-express
npm install
node index.js
```

## Reglas de Detección

Las reglas se definen en `src/rules/index.js` y son configurables. El sistema detecta automáticamente:

- Acceso a archivos sensibles (`.env`, `.git`, `.aws`, etc.)
- Paneles de administración (`wp-admin`, `phpmyadmin`, `actuator`, etc.)
- Métodos HTTP sospechosos (`TRACE`, `CONNECT`)
- User-Agents de scanners conocidos
- User-Agent vacío
- Respuestas HTTP 404

### Clasificación

| Severidad  | Ejemplos                                                               |
| ---------- | ---------------------------------------------------------------------- |
| **HIGH**   | `.env`, `.git`, `phpmyadmin`, `wp-admin`, `actuator`, `.aws`, `vendor` |
| **MEDIUM** | `graphql`, `admin`, `backup`, `config`, `phpinfo`                      |
| **LOW**    | `404`, `favicon inexistente`, `User-Agent vacío`                       |

## Estructura del Proyecto

```
Proyecto--Threat-Sentinel/
├── .env.example              # Variables de entorno de ejemplo
├── .gitignore                # Archivos ignorados por Git
├── package.json              # Dependencias y scripts
├── README.md                 # Este archivo
├── examples/
│   └── basic-express/        # Ejemplo de integración Express
│       ├── package.json
│       ├── .env.example
│       └── index.js
├── postman/
│   └── ThreatSentinel.postman_collection.json
└── src/
    ├── app.js                # Configuración de Express
    ├── server.js             # Punto de entrada
    ├── clients/
    │   └── ThreatLoggerClient.js   # Cliente HTTP reutilizable
    ├── config/
    │   └── index.js          # Configuración centralizada
    ├── constants/
    │   └── index.js          # Constantes del sistema
    ├── controllers/
    │   ├── eventController.js
    │   └── statsController.js
    ├── detectors/
    │   └── ThreatDetectorService.js  # Sistema de detección
    ├── docs/
    │   ├── API.md            # Documentación de la API
    │   ├── integration-guide.md      # Guía de integración
    │   └── extending-rules.md        # Guía para extender reglas
    ├── middlewares/
    │   ├── errorHandler.js          # Manejador de errores
    │   ├── threatLogger.js          # Middleware reutilizable
    │   └── validationMiddleware.js  # Validación con Joi
    ├── models/
    │   └── ThreatEvent.js    # Modelo Mongoose
    ├── routes/
    │   ├── eventRoutes.js
    │   └── statsRoutes.js
    ├── rules/
    │   └── index.js          # Reglas de detección configurables
    ├── services/
    │   ├── eventService.js   # Lógica de eventos
    │   └── statsService.js   # Lógica de estadísticas
    ├── utils/
    │   └── helpers.js        # Utilidades
    └── validators/
        └── eventValidator.js # Esquemas Joi
```

## Preparación para el Futuro

La arquitectura permite incorporar posteriormente sin modificar la estructura principal:

- GeoIP y ASN
- Reputación de IP
- Listas blancas/negras
- Bloqueo automático (Fail2Ban)
- Integración con Cloudflare
- Alertas (Discord, Telegram, Email)
- Exportación SIEM
- WebSockets para dashboards en tiempo real
- Dashboards en tiempo real

**Hoy el sistema detecta y almacena, pero no toma acciones automáticas.** Podés consultar eventos, filtrarlos, ver estadísticas (top IPs, paths, user-agents) e investigar atacantes manualmente vía API.

**Mañana**, la arquitectura ya está preparada para implementar: bloqueo automático de IPs (Fail2Ban/Cloudflare), listas negras, alertas en tiempo real (Discord/Telegram/Email), GeoIP, reputación de IP, exportación SIEM y dashboards con WebSockets. El README enumera todas estas capacidades como "Preparación para el Futuro".

Recomendación de prioridad: 1) Alertas, 2) Listas negras + bloqueo, 3) GeoIP, 4) Integración Cloudflare/Fail2Ban.

## Licencia

ISC
