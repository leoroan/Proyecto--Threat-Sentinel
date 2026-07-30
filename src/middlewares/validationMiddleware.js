/**
 * Middleware de validación.
 *
 * Middleware que utiliza Joi para validar los datos de entrada
 * antes de que lleguen a los controladores. Si la validación falla,
 * lanza un error que es capturado por el errorHandler.
 *
 * Separación: la definición de los esquemas está en validators/,
 * la ejecución está aquí como middleware de Express.
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
  req.query = value;
  next();
}

/**
 * Valida el ID en los parámetros de la ruta.
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
  req.params = value;
  next();
}

export { validateCreateEvent, validateListEvents, validateId };
