/**
 * Rutas de estadísticas.
 *
 * Define el endpoint para obtener estadísticas agregadas del sistema.
 */

import { Router } from "express";
import statsController from "../controllers/statsController.js";

const router = Router();

/**
 * GET /api/stats
 * Obtiene estadísticas agregadas del sistema.
 */
router.get("/", statsController.getStats);

export default router;
