Actúa como un Arquitecto de Software Senior y realiza una auditoría técnica completa del proyecto que acabas de generar.

**No modifiques código en esta etapa.**

Tu objetivo es validar si la implementación respeta el diseño y la arquitectura originalmente solicitados.

Quiero una revisión crítica y objetiva, no una descripción del proyecto.

---

## 1. Validación de arquitectura

Verifica que:

- exista una separación clara entre Router, Controller, Service y Model.
- no haya lógica de negocio dentro de controllers.
- las responsabilidades estén correctamente distribuidas.
- la estructura del proyecto sea coherente y escalable.
- no existan dependencias innecesarias entre módulos.

Indica cualquier violación encontrada.

---

## 2. Calidad del código

Analiza:

- legibilidad
- mantenibilidad
- reutilización
- complejidad
- cohesión
- acoplamiento

Detecta:

- código duplicado
- funciones demasiado largas
- clases o archivos con demasiadas responsabilidades
- nombres poco descriptivos
- malas prácticas

---

## 3. Validación funcional

Comprueba que realmente exista todo lo solicitado:

- modelo ThreatEvent
- ThreatDetectorService
- reglas configurables
- clasificación automática
- severidad
- categorías
- almacenamiento en Mongo
- API REST completa
- endpoint /health
- estadísticas
- índices de Mongo
- filtrado de headers sensibles
- manejo de errores
- validaciones

No asumas que existe: verifica.

---

## 4. Reglas de detección

Revisa que:

- no estén hardcodeadas por todas partes.
- exista un punto central de decisión.
- agregar una nueva regla sea sencillo.
- las reglas sean mantenibles.

Evalúa si el diseño realmente permite crecer.

---

## 5. Escalabilidad

Analiza si el proyecto permitirá incorporar en el futuro sin reescribir la arquitectura:

- GeoIP
- ASN
- reputación de IP
- listas negras
- listas blancas
- Fail2Ban
- Cloudflare
- alertas
- dashboards
- WebSockets
- exportaciones SIEM

Indica cualquier punto que hoy impediría esa evolución.

---

## 6. Seguridad

Verifica:

- Helmet
- Rate Limit
- CORS
- filtrado de información sensible
- validaciones
- manejo seguro de errores

Aclara cualquier riesgo encontrado.

---

## 7. Documentación

Comprueba que la documentación permita realmente reutilizar el proyecto dentro de otro backend.

Valida que explique:

- instalación
- configuración
- variables de entorno
- endpoints
- arquitectura
- flujo de trabajo
- extensión de reglas
- integración desde otro proyecto

Si falta información, indícalo.

---

## 8. Comentarios

Evalúa si los comentarios agregan valor.

Los comentarios deben explicar:

- decisiones de diseño
- responsabilidades
- puntos de extensión

No deben limitarse a describir código evidente.

---

## 9. Preparación para producción

Indica qué aspectos impedirían desplegar hoy este proyecto en producción.

Considera:

- configuración
- logging
- observabilidad
- manejo de errores
- rendimiento
- seguridad
- mantenibilidad

---

## 10. Resultado final

Genera un informe con cuatro secciones:

### ✅ Correcto

Todo lo que cumple satisfactoriamente.

### ⚠ Mejorable

Aspectos que funcionan pero podrían diseñarse mejor.

### ❌ Incumplimientos

Todo aquello que no respeta los requerimientos originales.

### ⭐ Recomendaciones

Sugerencias arquitectónicas para mejorar el proyecto sin cambiar su objetivo.

---

Importante:

- No escribas código.
- No propongas refactorizaciones todavía.
- No implementes cambios.
- Limítate a auditar el proyecto existente.
- Fundamenta cada observación indicando el archivo o módulo donde detectaste el problema.
- Si algún requisito no puede verificarse porque no fue implementado, indícalo explícitamente en lugar de asumirlo.
