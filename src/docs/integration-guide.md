# Guía de Integración para Threat Sentinel

Esta guía explica cómo integrar cualquier backend con el servicio Threat Sentinel para detectar y registrar eventos sospechosos.

## Formas de Integración

1. **Cliente HTTP** - Enviar eventos manualmente desde cualquier lenguaje.
2. **Middleware Express** - Integración automática en aplicaciones Express.
3. **API REST** - Enviar eventos directamente desde cualquier sistema.

---

## 1. Usando el Cliente HTTP (ThreatLoggerClient)

El cliente `ThreatLoggerClient` está diseñado para ser portátil. Cópialo a tu proyecto y úsalo.

### Instalación

Copia la carpeta `src/clients/` a tu proyecto. No requiere dependencias externas (usa `fetch` nativo de Node 18+).

### Uso Básico

```javascript
import ThreatLoggerClient from "./ruta/a/clients/ThreatLoggerClient.js";

const logger = new ThreatLoggerClient({
  endpoint: "http://localhost:3000",
  sourceApplication: "mi-api-node",
});

// En un endpoint de Express:
app.get("/api/datos", async (req, res) => {
  try {
    const data = await obtenerDatos();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });

    // Registrar el error como evento sospechoso
    await logger.log(req, { responseStatus: 500 });
  }
});
```

### Registro Manual

```javascript
import ThreatLoggerClient from "./clients/ThreatLoggerClient.js";

const logger = new ThreatLoggerClient({
  endpoint: "http://localhost:3000",
  sourceApplication: "mi-api",
});

// Enviar un evento manualmente
const evento = await logger.log(req, {
  responseStatus: 404,
  notes: "Intento de acceso a ruta inexistente",
});
```

---

## 2. Usando el Middleware Automático

El middleware `threatLogger` intercepta automáticamente las respuestas con código 4xx/5xx y las envía al servicio.

### En tu aplicación Express:

```javascript
import express from "express";
import threatLogger from "./src/middlewares/threatLogger.js";

const app = express();

// Registrar el middleware (debe ir antes de las rutas)
app.use(
  threatLogger({
    endpoint: "http://localhost:3000",
    sourceApplication: "mi-api-express",
  }),
);

// Tus rutas...
app.get("/", (req, res) => {
  res.json({ mensaje: "Hola mundo" });
});

app.listen(3001, () => {
  console.log("App corriendo en http://localhost:3001");
});
```

### Comportamiento

- Se ejecuta en **segundo plano**: no bloquea la respuesta al cliente.
- Solo envía eventos cuando el código de respuesta es >= 400.
- Los errores de red hacia Threat Sentinel se silencian para no afectar la aplicación principal.

---

## 3. Usando la API REST Directamente

Desde cualquier lenguaje o herramienta, puedes enviar eventos directamente a la API.

### curl

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "ip": "192.168.1.100",
    "method": "GET",
    "path": "/.env",
    "originalUrl": "/.env",
    "headers": {
      "user-agent": "curl/8.0",
      "host": "example.com"
    },
    "responseStatus": 404,
    "sourceApplication": "script-manual"
  }'
```

### Python

```python
import requests

response = requests.post("http://localhost:3000/api/events", json={
    "ip": "10.0.0.1",
    "method": "POST",
    "path": "/wp-admin",
    "originalUrl": "/wp-admin",
    "headers": {"user-agent": "python-requests", "host": "example.com"},
    "responseStatus": 404,
    "sourceApplication": "mi-script-python",
})

if response.status_code == 201:
    print("Evento registrado:", response.json())
else:
    print("Error:", response.json())
```

### Java (con HttpClient)

```java
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

HttpClient client = HttpClient.newHttpClient();
String json = """
{
    "ip": "10.0.0.2",
    "method": "GET",
    "path": "/.git/config",
    "originalUrl": "/.git/config",
    "headers": {"user-agent": "Java", "host": "example.com"},
    "responseStatus": 404,
    "sourceApplication": "mi-app-java"
}
""";

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("http://localhost:3000/api/events"))
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(json))
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());
```

---

## 4. Consultando Estadísticas

```bash
curl http://localhost:3000/api/stats
```

Respuesta:

```json
{
  "totalEventos": 150,
  "eventosHoy": 12,
  "topIPs": [{ "ip": "192.168.1.100", "count": 45 }],
  "topPaths": [{ "path": "/.env", "count": 40 }],
  "topCategorias": [{ "category": "dotenv", "count": 40 }]
}
```

---

## 5. Health Check

Verificar que el servicio esté funcionando:

```bash
curl http://localhost:3000/health
```

```json
{
  "status": "ok"
}
```

---

## Requisitos

- Node.js 18+ (por el uso de `fetch` nativo)
- El servicio Threat Sentinel debe estar corriendo y accesible desde la red
