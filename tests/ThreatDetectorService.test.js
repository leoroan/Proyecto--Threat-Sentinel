/**
 * Tests unitarios para ThreatDetectorService.
 *
 * Verifica que el motor de detección clasifique correctamente
 * cada tipo de amenaza según las reglas configuradas.
 *
 * Casos probados:
 *   - /.env        → high, dotenv
 *   - /.git        → high, git
 *   - /wp-admin    → high, wp-admin
 *   - /graphql     → medium, graphql
 *   - /robots.txt 404 → low, not-found (solo si ninguna regla coincide)
 *   - /favicon.ico 404 → low, not-found
 *   - Scanner conocido → high, scanner
 *   - User-Agent vacío → low, empty-user-agent
 *   - 404 normal sin regla → low, not-found
 *   - Petición normal sin sospecha → suspicious: false
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import ThreatDetectorService from "../src/detectors/ThreatDetectorService.js";

describe("ThreatDetectorService", () => {
  describe("Alta severidad (HIGH)", () => {
    it("debe detectar /.env como high/dotenv incluso con 404", () => {
      const result = ThreatDetectorService.detect({
        path: "/.env",
        userAgent: "Mozilla/5.0",
        method: "GET",
        responseStatus: 404,
      });
      assert.equal(result.suspicious, true);
      assert.equal(result.severity, "high");
      assert.equal(result.category, "dotenv");
      assert.equal(result.matchedRule, "dotenv-access");
    });

    it("debe detectar /.git como high/git", () => {
      const result = ThreatDetectorService.detect({
        path: "/.git/config",
        userAgent: "Mozilla/5.0",
        method: "GET",
        responseStatus: 404,
      });
      assert.equal(result.suspicious, true);
      assert.equal(result.severity, "high");
      assert.equal(result.category, "git");
      assert.equal(result.matchedRule, "git-access");
    });

    it("debe detectar /wp-admin como high/wp-admin", () => {
      const result = ThreatDetectorService.detect({
        path: "/wp-admin",
        userAgent: "Mozilla/5.0",
        method: "GET",
        responseStatus: 404,
      });
      assert.equal(result.suspicious, true);
      assert.equal(result.severity, "high");
      assert.equal(result.category, "wp-admin");
    });

    it("debe detectar /phpmyadmin como high/phpmyadmin", () => {
      const result = ThreatDetectorService.detect({
        path: "/phpmyadmin",
        userAgent: "Mozilla/5.0",
        method: "GET",
      });
      assert.equal(result.suspicious, true);
      assert.equal(result.severity, "high");
      assert.equal(result.category, "phpmyadmin");
    });
  });

  describe("Severidad media (MEDIUM)", () => {
    it("debe detectar /graphql como medium/graphql", () => {
      const result = ThreatDetectorService.detect({
        path: "/graphql",
        userAgent: "Mozilla/5.0",
        method: "GET",
      });
      assert.equal(result.suspicious, true);
      assert.equal(result.severity, "medium");
      assert.equal(result.category, "graphql");
    });

    it("debe detectar /admin como medium/admin", () => {
      const result = ThreatDetectorService.detect({
        path: "/admin",
        userAgent: "Mozilla/5.0",
        method: "GET",
      });
      assert.equal(result.suspicious, true);
      assert.equal(result.severity, "medium");
      assert.equal(result.category, "admin");
    });

    it("debe detectar /backup como medium/backup", () => {
      const result = ThreatDetectorService.detect({
        path: "/backup.sql",
        userAgent: "Mozilla/5.0",
        method: "GET",
      });
      assert.equal(result.suspicious, true);
      assert.equal(result.severity, "medium");
      assert.equal(result.category, "backup");
    });

    it("debe detectar CONNECT como medium/suspicious-method", () => {
      const result = ThreatDetectorService.detect({
        path: "/",
        userAgent: "Mozilla/5.0",
        method: "CONNECT",
      });
      assert.equal(result.suspicious, true);
      assert.equal(result.severity, "medium");
      assert.equal(result.category, "suspicious-method");
    });
  });

  describe("Severidad baja (LOW)", () => {
    it("debe detectar 404 normal como low/not-found", () => {
      const result = ThreatDetectorService.detect({
        path: "/ruta-aleatoria-no-existente",
        userAgent: "Mozilla/5.0",
        method: "GET",
        responseStatus: 404,
      });
      assert.equal(result.suspicious, true);
      assert.equal(result.severity, "low");
      assert.equal(result.category, "not-found");
    });

    it("debe detectar User-Agent vacío como low/empty-user-agent", () => {
      const result = ThreatDetectorService.detect({
        path: "/ruta-normal",
        userAgent: "",
        method: "GET",
      });
      assert.equal(result.suspicious, true);
      assert.equal(result.severity, "low");
      assert.equal(result.category, "empty-user-agent");
    });
  });

  describe("Scanners conocidos", () => {
    it("debe detectar acunetix como high/scanner", () => {
      const result = ThreatDetectorService.detect({
        path: "/",
        userAgent: "Acunetix-Web-Vulnerability-Scanner",
        method: "GET",
      });
      assert.equal(result.suspicious, true);
      assert.equal(result.severity, "high");
      assert.equal(result.category, "scanner");
    });

    it("debe detectar nmap como high/scanner", () => {
      const result = ThreatDetectorService.detect({
        path: "/",
        userAgent: "Nmap Scripting Engine",
        method: "GET",
      });
      assert.equal(result.suspicious, true);
      assert.equal(result.severity, "high");
      assert.equal(result.category, "scanner");
    });

    it("debe detectar sqlmap como high/scanner", () => {
      const result = ThreatDetectorService.detect({
        path: "/",
        userAgent: "sqlmap/1.6",
        method: "GET",
      });
      assert.equal(result.suspicious, true);
      assert.equal(result.severity, "high");
      assert.equal(result.category, "scanner");
    });
  });

  describe("Peticiones normales", () => {
    it("debe retornar suspicious: false para peticiones normales", () => {
      const result = ThreatDetectorService.detect({
        path: "/api/usuarios",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        method: "GET",
      });
      assert.equal(result.suspicious, false);
    });

    it("debe retornar suspicious: false para peticiones POST normales", () => {
      const result = ThreatDetectorService.detect({
        path: "/api/login",
        userAgent: "Mozilla/5.0",
        method: "POST",
      });
      assert.equal(result.suspicious, false);
    });

    it("debe retornar suspicious: false para OPTIONS en ruta existente", () => {
      const result = ThreatDetectorService.detect({
        path: "/api/usuarios",
        userAgent: "Mozilla/5.0",
        method: "OPTIONS",
        responseStatus: 200,
      });
      assert.equal(result.suspicious, false);
    });
  });
});
