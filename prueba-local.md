## Prueba local exitosa ✅

El servidor está corriendo en `http://localhost:3000` conectado a MongoDB Atlas y registrando eventos automáticamente.

### Bug corregido durante la prueba

**Express 5 `req.query` read-only**: El middleware de validación intentaba reasignar `req.query = value`, pero Express 5 hace esa propiedad read-only. Se corrigió usando `res.locals.query` para pasar los valores validados al controlador.

**Archivos modificados:**

- `src/middlewares/validationMiddleware.js` - Usa `res.locals` en lugar de reasignar `req.query`/`req.params`
- `src/controllers/eventController.js` - Lee de `res.locals.query` con fallback a `req.query`

### Resultados de la prueba real

**6 ataques enviados con curl:**

```powershell
curl -s http://localhost:3000/.env
curl -s http://localhost:3000/.git/config
curl -s http://localhost:3000/wp-admin
curl -s http://localhost:3000/phpmyadmin
curl -s -A "Nmap Scripting Engine" http://localhost:3000/
curl -s http://localhost:3000/graphql
```

**12 eventos registrados en MongoDB Atlas** (6 de la primera tanda + 6 de la segunda):

| Path           | Severity   | Category   | MatchedRule       |
| -------------- | ---------- | ---------- | ----------------- |
| `/.env`        | **high**   | dotenv     | dotenv-access     |
| `/.git/config` | **high**   | git        | git-access        |
| `/wp-admin`    | **high**   | wp-admin   | wp-admin-access   |
| `/phpmyadmin`  | **high**   | phpmyadmin | phpmyadmin-access |
| `/` (Nmap)     | **high**   | scanner    | known-scanner     |
| `/graphql`     | **medium** | graphql    | graphql-access    |

**Verificaciones clave:**

- ✅ `/.env` con 404 se clasificó como `high/dotenv` (no `low/not-found`)
- ✅ `/health` NO generó eventos (excluido correctamente)
- ✅ `/api/events` y `/api/stats` NO generaron eventos (excluidos)
- ✅ Todos los eventos tienen `sourceApplication: "threat-sentinel-internal"`
- ✅ Las estadísticas muestran 12 eventos, 6 paths, 2 user-agents, 6 categorías
- ✅ No hay peticiones HTTP internas (todo via `eventService.createEvent()`)

### Comandos para probar desde PowerShell

```powershell
# Health check
curl http://localhost:3000/health

# Enviar ataques (se registran automáticamente)
curl http://localhost:3000/.env
curl http://localhost:3000/.git/config
curl http://localhost:3000/wp-admin
curl -A "Nmap Scripting Engine" http://localhost:3000/

# Ver eventos registrados
curl "http://localhost:3000/api/events?page=1&limit=10&sort=createdAt&order=desc"

# Ver estadísticas
curl http://localhost:3000/api/stats

# Enviar evento manualmente (como lo haría un backend externo)
curl -X POST http://localhost:3000/api/events -H "Content-Type: application/json" -d '{\"ip\":\"10.0.0.1\",\"method\":\"GET\",\"path\":\"/.aws/credentials\",\"originalUrl\":\"/.aws/credentials\",\"headers\":{\"user-agent\":\"curl/8.0\"},\"responseStatus\":404,\"sourceApplication\":\"mi-api-externa\"}'
```
