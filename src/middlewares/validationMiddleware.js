/**
 * Middleware de validación.
 *
 * Utiliza Joi para validar los datos de entrada antes de que lleguen
 * a los controladores. Si la validación falla, lanza un error que
 * es capturado por el errorHandler.
 *
 * En Express 5, req.query y req.params son read-only (getter only),
 * por lo que los valores validados se pasan al controlador mediante
 * res.locals en lugar de reasignar la propiedad.
 */

import {
  createEventSchema,
  listEventsSchema,
  idSchema,
} from "../validators/eventValidator.js";

/**
 * Valida el cuerpo de la solicitud para crear un evento.
 */
function validateCreateEvent(req, res, next) {
  const { error, value } = createEventSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    error.isJoi = true;
    return next(error);
  }
  req.body = value;
  next();
}

/**
 * Valida los query params para listar eventos.
 * Los valores validados se almacenan en res.locals.query.
 */
function validateListEvents(req, res, next) {
  const { error, value } = listEventsSchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    error.isJoi = true;
    return next(error);
  }
  res.locals.query = value;
  next();
}

/**
 * Valida el ID en los parámetros de la ruta.
 * Los valores validados se almacenan en res.locals.params.
 */
function validateId(req, res, next) {
  const { error, value } = idSchema.validate(req.params, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    error.isJoi = true;
    return next(error);
  }
  res.locals.params = value;
  next();
}

export { validateCreateEvent, validateListEvents, validateId };
