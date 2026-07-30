# Auditoría Técnica Completa: Threat Sentinel

## 1. Validación de Arquitectura

### ✅ Correcto

- **Separación Router → Controller → Service → Model**: Se respeta en todos los módulos. Cada capa tiene su responsabilidad claramente definida.
- **Controladores sin lógica de negocio**: `eventController.js` y `statsController.js` se limitan a delegar en los servicios y manejar la respuesta HTTP. No contienen lógica de dominio.
- **Estructura de directorios**: Coincide con la solicitada en el README. Las carpetas `config/`, `constants/`, `controllers/`, `detectors/`, `middlewares/`, `models/`, `routes/`, `services/`, `validators/`, `utils/`, `clients/`, `docs/` están todas presentes.
- **Modularidad**: Cada módulo importa solo lo que necesita. No hay dependencias circulares.

### ⚠ Mejorable

- **Validación dual**: Los esquemas de validación están en `validators/eventValidator.js` pero la ejecución como middleware está en `middlewares/validationMiddleware.js`. Esta separación es correcta en principio, pero el nombre del middleware (`validationMiddleware.js`) es genérico y podría confundirse con otros middlewares de validación futuros.
- **Acoplamiento cliente-servidor**: `ThreatLoggerClient.js` (en `src/clients/`) y `threatLogger.js` (en `src/middlewares/`) están dentro del mismo proyecto. Para que un proyecto externo los use, necesita copiar la carpeta o referenciar rutas relativas (`../../src/...`). El ejemplo `basic-express/index.js` importa desde `../../src/middlewares/threatLogger.js`, lo que acopla el ejemplo a la estructura del proyecto principal.

### ❌ Incumplimientos

- **Ninguno detectado en la separación arquitectónica.**

---

## 2. Calidad del Código

### ✅ Correcto

- **Funciones pequeñas**: Cada función tiene una responsabilidad única y tamaño adecuado.
- **Nombres descriptivos**: `createEvent`, `listEvents`, `filterSensitiveHeaders`, `detect` son claros.
- **Uso de async/await**: Consistente en toda la base de código.
- **Manejo de errores con try/catch**: Todos los controladores envuelven la lógica en try/catch y delegan en `next(error)`.
- **Código legible**: La estructura y los comentarios facilitan la comprensión.

### ⚠ Mejorable

- **Duplicación de lógica de extracción de IP**: `utils/helpers.js` tiene `getClientIp()` que extrae la IP del cliente. `ThreatLoggerClient.js` tiene `_getClientIp()` que hace exactamente lo mismo. Esto viola DRY.
- **`filterSensitiveHeaders()` está en `eventService.js`**: Es una función de utilidad pura que debería estar en `utils/helpers.js` para ser reutilizable por otros servicios.
- **Comentario con caracteres extraños**: En `src/rules/index.js` línea 74 de la documentación del ejemplo dice "coincidencia por包含" — mezcla español con caracteres chinos. Es un artefacto de generación.
- **Typo en nombre de campo**: `statsService.js` línea 55 devuelve `eventossUltimaHora` (doble 's') en lugar de `eventosUltimaHora`. Esto afecta la API pública y cualquier cliente que consuma este endpoint.

### ❌ Incumplimientos

- **Ninguno crítico.** La duplicación y el typo son mejorables pero no bloqueantes.

---

## 3. Validación Funcional

### ✅ Correcto - Todo lo solicitado está implementado:

| Requisito                   | Estado | Archivo                                                                    |
| --------------------------- | ------ | -------------------------------------------------------------------------- |
| Modelo ThreatEvent          | ✅     | `src/models/ThreatEvent.js` - Todos los campos requeridos presentes        |
| ThreatDetectorService       | ✅     | `src/detectors/ThreatDetectorService.js` - Método `detect(event)`          |
| Reglas configurables        | ✅     | `src/rules/index.js` - 26 reglas en array configurable                     |
| Clasificación automática    | ✅     | `detect()` retorna `{suspicious, severity, category, matchedRule, reason}` |
| Severidad (HIGH/MEDIUM/LOW) | ✅     | Asignada según el tipo de amenaza                                          |
| Categorías                  | ✅     | `dotenv`, `git`, `scanner`, `not-found`, etc.                              |
| Almacenamiento MongoDB      | ✅     | Mongoose model con persistencia                                            |
| POST /api/events            | ✅     | Crea evento, retorna 201                                                   |
| GET /api/events             | ✅     | Listado paginado con filtros                                               |
| GET /api/events/:id         | ✅     | Detalle completo                                                           |
| DELETE /api/events/:id      | ✅     | Elimina evento                                                             |
| GET /api/stats              | ✅     | 8 métricas agregadas                                                       |
| GET /health                 | ✅     | `{ status: "ok" }`                                                         |
| Índices MongoDB             | ✅     | createdAt, ip, severity, category, sourceApplication, path + compuestos    |
| Filtrado headers sensibles  | ✅     | Authorization, Cookie, etc.                                                |
| Manejo de errores           | ✅     | errorHandler centralizado                                                  |
| Validaciones                | ✅     | Joi en todos los endpoints                                                 |

### ⚠ Mejorable

- **El endpoint `/health` no verifica la conexión a MongoDB**: Solo responde `{ status: "ok" }` sin verificar que la base de datos esté realmente operativa. En producción, un health check debería validar la conectividad con la DB.

### ❌ Incumplimientos

- **Ninguno.** Todos los requisitos funcionales del README están cubiertos.

---

## 4. Reglas de Detección

### ✅ Correcto

- **Reglas centralizadas**: Todas en `src/rules/index.js`. No hay reglas hardcodeadas en el detector.
- **Punto único de decisión**: `ThreatDetectorService.detect()` es el único lugar donde se evalúan las reglas.
- **Extensibilidad**: Agregar una regla es tan simple como añadir un objeto al array `rules`.
- **Documentación de extensión**: `src/docs/extending-rules.md` explica claramente cómo agregar reglas.

### ⚠ Mejorable

- **Las reglas no son configurables en caliente**: Están definidas estáticamente en un array importado. No hay forma de agregar/eliminar reglas sin reiniciar el servidor. Para un IDS en evolución, sería deseable poder cargar reglas desde MongoDB o un archivo de configuración externo.
- **No hay pruebas unitarias para las reglas**: No hay tests que verifiquen que cada regla detecta correctamente su patrón objetivo.

### ❌ Incumplimiento crítico

- **`ThreatDetectorService.detect()` cortocircuita con 404 ANTES de evaluar las reglas**: En la línea 52-60, si `responseStatus === 404`, retorna inmediatamente con `severity: "low"` y `category: "not-found"`. Esto significa que si un atacante accede a `/.env` y el servidor responde 404, el evento se clasifica como **low/not-found** en lugar de **high/dotenv**. La regla de 404 debería ejecutarse SOLO si ninguna otra regla coincide, no al revés. Esto es un error de diseño que afecta directamente la precisión del sistema de detección.

---

## 5. Escalabilidad

### ✅ Correcto

- **Campos preparados en el modelo**: `country`, `city`, `asn`, `organization` ya existen en `ThreatEvent.js` para futuras integraciones GeoIP/ASN.
- **Arquitectura permite extensión**: Agregar servicios de alertas, listas blancas/negras, o bloqueo automático se hace creando nuevos servicios sin modificar los existentes.
- **Servicios desacoplados**: `eventService` y `statsService` son independientes y pueden extenderse con nuevos métodos.

### ⚠ Mejorable

- **No hay patrón de Inyección de Dependencias**: Los servicios importan directamente los modelos y detectores. Esto dificulta el testing unitario y el reemplazo de implementaciones (ej: cambiar el motor de detección).
- **Las reglas no son dinámicas**: Para soportar listas negras/blancas en tiempo real, el sistema de reglas necesitaría poder cargarse desde una fuente externa (DB, Redis, API). Hoy está limitado a un array estático.
- **No hay event bus / pub-sub**: Para integrar alertas (Discord, Telegram, Email) o WebSockets, sería necesario un mecanismo de publicación/suscripción que hoy no existe. Los servicios actuales solo persisten y consultan.

### ❌ Incumplimientos

- **Ninguno.** La arquitectura actual no impide las extensiones futuras mencionadas, pero requeriría agregar módulos adicionales.

---

## 6. Seguridad

### ✅ Correcto

- **Helmet**: Configurado en `app.js` línea 38. Protege contra vulnerabilidades HTTP comunes.
- **Rate Limit**: Configurado en `app.js` líneas 52-64. 100 peticiones por ventana de 15 minutos.
- **CORS configurable**: Desde `.env` con `CORS_ORIGINS`.
- **Filtrado de headers sensibles**: `filterSensitiveHeaders()` en `eventService.js` elimina `authorization`, `cookie`, `set-cookie`, `x-api-key`, `api-key`, `token`, `x-auth-token`, `password`, `secret`.
- **Validaciones Joi**: Todos los endpoints validan entrada.
- **Manejo seguro de errores**: `errorHandler.js` no expone stack traces en producción (solo en desarrollo).

### ⚠ Mejorable

- **`allowedHeaders` restrictivo**: En `app.js` línea 47, solo se permiten `Content-Type` y `Authorization`. Si un cliente necesita enviar headers personalizados (ej: `X-Request-ID`), serán bloqueados por CORS en el navegador.
- **Rate Limit aplicado a `/health`**: Los sistemas de monitoreo que consultan `/health` frecuentemente podrían ser rate-limited. Sería mejor excluir `/health` del rate limiter.
- **No hay protección contra MongoDB injection**: Aunque Mongoose ofrece cierta protección, el uso de `$gte` y `$lte` en `listEvents` (líneas 134-136) con valores proporcionados por el usuario podría ser explotado si se pasan objetos en lugar de strings ISO. El validador Joi los acepta como `date().iso()` pero si la validación falla, los valores crudos podrían llegar al servicio si no se usa `stripUnknown`.
- **No hay sanitización de query params**: El objeto `query` se almacena directamente sin sanitizar (ThreatEvent.js línea 32). Un atacante podría enviar un query malicioso.

### ❌ Incumplimientos

- **Ninguno crítico.** Las observaciones son prevenciones, no vulnerabilidades activas.

---

## 7. Documentación

### ✅ Correcto

- **README.md**: Cubre objetivo, arquitectura, instalación, configuración, despliegue, variables de entorno, ejecución, scripts npm, estructura del proyecto.
- **API.md**: Documenta todos los endpoints con ejemplos de request/response.
- **integration-guide.md**: Explica cómo integrar desde Express, Python, Java, curl. Incluye ejemplos completos.
- **extending-rules.md**: Explica estructura de reglas, campos, ejemplos, buenas prácticas.
- **.env.example**: Documenta todas las variables con descripción y valores por defecto.
- **Postman collection**: Incluye 6 endpoints con variables de entorno.

### ⚠ Mejorable

- **README.md no menciona que MongoDB debe estar instalado y corriendo**: Asume que el usuario tiene MongoDB.
- **integration-guide.md no aclara que el cliente necesita Node 18+**: Menciona `fetch` nativo pero no dice explícitamente la versión mínima de Node requerida.
- **No hay guía de despliegue**: No se menciona Docker, docker-compose, o despliegue en producción.
- **No hay guía de troubleshooting**: No se documentan errores comunes ni cómo resolverlos.

### ❌ Incumplimientos

- **Ninguno.** Toda la documentación requerida está presente.

---

## 8. Comentarios

### ✅ Correcto

- **Comentarios de diseño**: Explican _por qué_ se tomaron ciertas decisiones (ej: "Las reglas NO están hardcodeadas en el detector").
- **Responsabilidades**: Cada módulo tiene un comentario JSDoc explicando su responsabilidad.
- **Puntos de extensión**: Casi todos los módulos indican cómo extenderlos (ej: "Agregar aquí nuevos métodos para exportación SIEM").
- **JSDoc en funciones**: Parámetros, retornos y excepciones documentados.

### ⚠ Mejorable

- **Comentarios redundantes**: En `app.js` líneas 33-35, 66-68, 79-81, 92-94 los comentarios de sección (`// =====`) son innecesarios. El código ya es autoexplicativo.
- **Comentario con caracteres extraños**: En `src/rules/index.js` el ejemplo de la documentación inline contiene "coincidencia por包含" que mezcla español y chino. Es un error de generación.

### ❌ Incumplimientos

- **Ninguno.** Los comentarios agregan valor y no son triviales.

---

## 9. Preparación para Producción

### ✅ Correcto

- **Cierre graceful**: `server.js` maneja SIGTERM y SIGINT, cerrando conexiones correctamente.
- **Configuración externalizada**: Todo mediante `.env`.
- **Error handler sin leaks**: No expone stack traces en producción.

### ❌ Aspectos que impedirían desplegar hoy en producción

1. **Sin tests automatizados**: `package.json` no tiene un test runner configurado. No hay pruebas unitarias ni de integración.
2. **Logging sin estructura**: Usa `console.log`/`console.error` en lugar de un logger estructurado (Winston, Pino). No hay niveles de log, ni formato JSON para agregación.
3. **Health check superficial**: `GET /health` no verifica conectividad con MongoDB. Un health check real debería verificar la DB y reportar el estado.
4. **Sin manejo de reconexión de MongoDB**: Si MongoDB se cae, `mongoose.connect()` falla y el proceso termina con `process.exit(1)`. No hay reconexión automática ni reintentos.
5. **Sin métricas de rendimiento**: No hay indicadores como tiempo de respuesta, tasa de eventos, ni endpoints de métricas (Prometheus).
6. **Sin documentación de despliegue**: No hay Dockerfile, docker-compose.yml, ni guía de despliegue.
7. **Sin validación de CORS_ORIGINS vacío**: Si `CORS_ORIGINS` está vacío, `"".split(",")` produce `[""]` que rompe CORS.
8. **El bug del 404 cortocircuito**: Clasifica incorrectamente amenazas de alta severidad como bajas, lo que hace que el sistema no sea confiable para detección real.
9. **Sin protección contra DoS en queries**: Las consultas sin índice en campos no indexados podrían degradar MongoDB.
10. **Sin request ID tracking**: No hay un identificador único por request para correlacionar logs.

---

## 10. Resultado Final

### ✅ Correcto

| Aspecto                                              | Estado                                                |
| ---------------------------------------------------- | ----------------------------------------------------- |
| Arquitectura (Router → Controller → Service → Model) | ✅ Implementada correctamente                         |
| Separación de responsabilidades                      | ✅ Sin lógica de negocio en controladores             |
| Modelo ThreatEvent completo                          | ✅ Todos los campos requeridos                        |
| ThreatDetectorService centralizado                   | ✅ Único punto de detección                           |
| Reglas configurables en rules/                       | ✅ 26 reglas, externalizadas del detector             |
| API REST completa (6 endpoints)                      | ✅ Todos los endpoints solicitados                    |
| Seguridad (Helmet, CORS, Rate Limit)                 | ✅ Implementados                                      |
| Filtrado de headers sensibles                        | ✅ 9 tipos de headers filtrados                       |
| Validaciones Joi                                     | ✅ En todos los endpoints                             |
| Manejo de errores centralizado                       | ✅ Sin leaks en producción                            |
| Cliente reutilizable (ThreatLoggerClient)            | ✅ Implementado                                       |
| Middleware reutilizable (threatLogger)               | ✅ Implementado                                       |
| Documentación                                        | ✅ README, API.md, integration-guide, extending-rules |
| Postman Collection                                   | ✅ 6 endpoints documentados                           |
| Cierre graceful                                      | ✅ SIGTERM + SIGINT                                   |
| Índices MongoDB                                      | ✅ 6 índices simples + 2 compuestos                   |
| Comentarios de diseño y extensión                    | ✅ Presentes en todos los módulos                     |

### ⚠ Mejorable

| Issue                                          | Archivo                                              | Impacto                                |
| ---------------------------------------------- | ---------------------------------------------------- | -------------------------------------- |
| Duplicación de `getClientIp()`                 | `utils/helpers.js` y `clients/ThreatLoggerClient.js` | Violación DRY, mantenimiento duplicado |
| `filterSensitiveHeaders()` en lugar incorrecto | `services/eventService.js`                           | Debería estar en `utils/helpers.js`    |
| Typo `eventossUltimaHora`                      | `services/statsService.js`                           | Afecta API pública, rompe clientes     |
| Comentario con caracteres extraños             | `rules/index.js` (documentación inline)              | Confunde al desarrollador              |
| `allowedHeaders` restrictivo en CORS           | `app.js` línea 47                                    | Podría bloquear headers legítimos      |
| Rate Limit en `/health`                        | `app.js` línea 64                                    | Afecta monitoreo                       |
| Sin validación de `CORS_ORIGINS` vacío         | `app.js` línea 42-45                                 | Rompe CORS si está vacío               |
| Sin tests automatizados                        | `package.json`                                       | No se puede verificar calidad          |
| Logging sin estructura                         | Todo el proyecto                                     | Dificulta debugging en producción      |
| Health check sin verificación de DB            | `src/app.js` línea 84-86                             | No detecta problemas de conexión       |

### ❌ Incumplimientos

| Issue                                  | Archivo                                               | Gravedad  | Descripción                                                                                                                                                                                                                                          |
| -------------------------------------- | ----------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cortocircuito 404 antes que reglas** | `src/detectors/ThreatDetectorService.js` líneas 52-60 | **ALTA**  | Si un ataque a `/.env` genera 404, se clasifica como `low/not-found` en lugar de `high/dotenv`. La detección de 404 DEBE ejecutarse después de las reglas, no antes. Esto invalida la precisión de todo el sistema de detección para respuestas 404. |
| Sin manejo de reconexión MongoDB       | `src/server.js` línea 27-31                           | **MEDIA** | Si MongoDB se cae, el proceso termina. No hay reconexión automática.                                                                                                                                                                                 |
| Sin documentación de despliegue        | Proyecto                                              | **MEDIA** | No hay Dockerfile, docker-compose, ni guía de despliegue.                                                                                                                                                                                            |

### ⭐ Recomendaciones

1. **⚠️ CRÍTICO**: Revertir el orden de evaluación en `ThreatDetectorService.detect()`: evaluar primero las reglas de path/method/userAgent, y solo si ninguna coincide, verificar si es 404 como fallback. Esto corrige la clasificación incorrecta.

2. **Mover funciones de utilidad duplicadas** a `utils/helpers.js`: `getClientIp()` y `filterSensitiveHeaders()` deberían estar en un solo lugar y ser importadas desde allí.

3. **Corregir typo** `eventossUltimaHora` → `eventosUltimaHora` en `statsService.js` para mantener consistencia en la API.

4. **Agregar test de integración** básico que verifique:
   - Que una solicitud a `/.env` con 404 se clasifique como `high/dotenv` (después de corregir el punto 1).
   - Que un 404 normal se clasifique como `low/not-found`.
   - Que un User-Agent de scanner se detecte correctamente.

5. **Excluir `/health` del rate limiter** para evitar que sistemas de monitoreo sean bloqueados.

6. **Agregar verificación de MongoDB en `/health`** para que refleje el estado real del servicio.

7. **Reemplazar `console.log`/`console.error`** por un logger estructurado (Winston o Pino) con niveles (info, warn, error) y formato JSON.

8. **Agregar Dockerfile y docker-compose.yml** con MongoDB para facilitar el despliegue y las pruebas locales.

9. **Considerar un sistema de reglas dinámicas** que permita cargar reglas desde MongoDB o un archivo JSON externo, permitiendo actualizaciones sin reiniciar el servidor.

10. **Agregar un patrón de Inyección de Dependencias** (o al menos permitir pasar dependencias como parámetros) para facilitar el testing unitario de `ThreatDetectorService` y `eventService`.
