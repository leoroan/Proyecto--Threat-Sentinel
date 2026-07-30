/**
 * Validadores para los endpoints de eventos.
 *
 * Utiliza Joi para definir esquemas de validación consistentes
 * y reutilizables. Centraliza toda la validación de entrada
 * para evitar datos malformados o maliciosos.
 */

import Joi from "joi";

/** Esquema para crear un nuevo evento */
export const createEventSchema = Joi.object({
  ip: Joi.string().max(45).required(),
  method: Joi.string()
    .valid(
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "HEAD",
      "OPTIONS",
      "TRACE",
      "CONNECT",
    )
    .required(),
  path: Joi.string().max(2000).required(),
  originalUrl: Joi.string().max(2000).required(),
  query: Joi.object().unknown(),
  headers: Joi.object().unknown(),
  userAgent: Joi.string().max(500).allow("").default(""),
  referer: Joi.string().max(2000).allow("").default(""),
  host: Joi.string().max(255).allow("").default(""),
  protocol: Joi.string().max(20).allow("").default(""),
  httpVersion: Joi.string().max(10).allow("").default(""),
  responseStatus: Joi.number()
    .integer()
    .min(100)
    .max(599)
    .allow(null)
    .default(null),
  sourceApplication: Joi.string().max(100).allow("").default(""),
  notes: Joi.string().max(2000).allow("").default(""),
});

/** Esquema para los parámetros de consulta del listado */
export const listEventsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string()
    .valid("createdAt", "ip", "severity", "category", "path")
    .default("createdAt"),
  order: Joi.string().valid("asc", "desc").default("desc"),
  severity: Joi.string().valid("low", "medium", "high"),
  category: Joi.string().max(50),
  ip: Joi.string().max(45),
  sourceApplication: Joi.string().max(100),
  desde: Joi.date().iso(),
  hasta: Joi.date().iso(),
});

/** Esquema para el ID del evento */
export const idSchema = Joi.object({
  id: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "El ID debe ser un ObjectId válido de MongoDB",
    }),
});
