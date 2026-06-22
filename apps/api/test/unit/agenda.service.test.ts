import { describe, it, expect } from "@jest/globals";

import {
  canReschedule,
  formatTimeLabel,
  getDayRange,
  RESCHEDULE_CUTOFF_HOURS,
} from "../../src/services/agenda.service.js";
import { UserRole } from "../../src/models/User.js";

describe("Pruebas Unitarias: Lógica de Agenda (Agenda Service)", () => {
  describe("formatTimeLabel", () => {
    it("Debería formatear correctamente una hora exacta (Ej: 08:05)", () => {
      const date = new Date("2026-01-01T08:05:00");
      const label = formatTimeLabel(date);
      expect(label).toBe("08:05");
    });

    it("Debería formatear correctamente horas de la tarde (Ej: 15:30)", () => {
      const date = new Date("2026-01-01T15:30:00");
      const label = formatTimeLabel(date);
      expect(label).toBe("15:30");
    });
  });

  describe("getDayRange", () => {
    it("Debería retornar el inicio y fin correctos para una fecha dada", () => {
      const { start, end, dateKey } = getDayRange("2026-10-15");

      expect(dateKey).toBe("2026-10-15");
      expect(start.getHours()).toBe(0);
      expect(start.getMinutes()).toBe(0);
      expect(end.getHours()).toBe(23);
      expect(end.getMinutes()).toBe(59);
    });
  });

  describe("canReschedule (Reglas de Negocio)", () => {
    it("Debería permitir al ADMIN reprogramar siempre, sin importar la hora", () => {
      const pastDate = new Date(Date.now() - 100000); // Fecha en el pasado
      const result = canReschedule(pastDate, UserRole.ADMIN);

      expect(result.allowed).toBe(true);
    });

    it("Debería permitir a MANTENIMIENTO reprogramar si faltan MÁS horas que el límite de corte", () => {
      // Configuramos la cita para 5 horas en el futuro
      const futureDate = new Date(
        Date.now() + (RESCHEDULE_CUTOFF_HOURS + 3) * 60 * 60 * 1000,
      );
      const result = canReschedule(futureDate, UserRole.MANTENIMIENTO);

      expect(result.allowed).toBe(true);
    });

    it("Debería DENEGAR a MANTENIMIENTO reprogramar si faltan MENOS horas que el límite de corte", () => {
      // Configuramos la cita para solo 1 hora en el futuro (asumiendo que el límite es 2)
      const nearFutureDate = new Date(Date.now() + 1 * 60 * 60 * 1000);
      const result = canReschedule(nearFutureDate, UserRole.MANTENIMIENTO);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain(RESCHEDULE_CUTOFF_HOURS.toString());
    });
  });
});
