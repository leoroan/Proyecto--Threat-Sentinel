/**
 * Manejador centralizado de errores.
 */

import config from "../config/index.js";
import logger from "../utils/logger.js";

function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Error interno del servidor";
  let code = err.code || "INTERNAL_ERROR";

  if (err.isJoi) {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    message = err.details.map((d) => d.message).join(", ");
  }

  if (err.name === "CastError") {
    statusCode = 400;
    code = "INVALID_ID";
    message = "El ID proporcionado no es válido";
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join(", ");
  }

  if (err.code === 11000) {
    statusCode = 409;
    code = "DUPLICATE_ERROR";
    message = "El recurso ya existe";
  }

  const response = {
    error: {
      code,
      message,
    },
  };

  if (config.nodeEnv === "development") {
    response.error.stack = err.stack;
  }

  logger.error(
    { statusCode, code, message, stack: err.stack },
    "Error en la solicitud",
  );

  res.status(statusCode).json(response);
}

export default errorHandler;
