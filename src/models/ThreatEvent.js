/**
 * Modelo Mongoose para ThreatEvent.
 *
 * Los índices se definen en el schema, no se crean dinámicamente.
 * El índice TTL se agrega condicionalmente según la configuración
 * de EVENT_RETENTION_DAYS en .env.
 */

import mongoose from "mongoose";
import config from "../config/index.js";

const { Schema, model } = mongoose;

const threatEventSchema = new Schema(
  {
    ip: { type: String, required: true, index: true },
    method: { type: String, required: true },
    path: { type: String, required: true, index: true },
    originalUrl: { type: String, required: true },
    query: { type: Schema.Types.Mixed, default: {} },
    headers: { type: Schema.Types.Mixed, default: {} },
    userAgent: { type: String, default: "" },
    referer: { type: String, default: "" },
    host: { type: String, default: "" },
    protocol: { type: String, default: "" },
    httpVersion: { type: String, default: "" },

    responseStatus: { type: Number, default: null },
    sourceApplication: { type: String, index: true, default: "" },

    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    matchedRule: { type: String, default: "" },
    reason: { type: String, default: "" },

    notes: { type: String, default: "" },
    country: { type: String, default: "" },
    city: { type: String, default: "" },
    asn: { type: String, default: "" },
    organization: { type: String, default: "" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Índices compuestos para consultas frecuentes (severidad + fecha, aplicación + fecha)
threatEventSchema.index({ severity: 1, createdAt: -1 });
threatEventSchema.index({ sourceApplication: 1, createdAt: -1 });

// Índice TTL: expira eventos automáticamente según EVENT_RETENTION_DAYS.
// Pertenece al modelo, no se crea dinámicamente en server.js.
if (config.eventRetentionDays > 0) {
  threatEventSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: config.eventRetentionDays * 24 * 60 * 60 },
  );
}

const ThreatEvent = model("ThreatEvent", threatEventSchema);

export default ThreatEvent;
