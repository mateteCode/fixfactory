import type { Request, Response, NextFunction } from "express";
import type { Model } from "mongoose";

/**
 * Valida si un recurso pertenece a la empresa del usuario.
 * @param model El modelo de Mongoose (Machine, Issue, etc.)
 * @param fieldName El nombre del campo en el req que contiene el ID (ej: 'id' o 'machine')
 * @param source De dónde sacar el ID: 'params', 'body' o 'query'
 */
export const validateOwnership = (
  model: Model<any>,
  fieldName: string,
  source: "params" | "body" | "query" = "params",
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = (req as any).companyId;
      const resourceId = req[source][fieldName];

      if (!resourceId) {
        return res
          .status(400)
          .json({
            message: `Falta el campo ${fieldName} para validar pertenencia.`,
          });
      }

      // Buscamos el recurso filtrando por su ID y por la empresa del usuario
      const exists = await model.findOne({
        _id: resourceId,
        company: companyId,
      });

      if (!exists) {
        return res.status(403).json({
          message: `Acceso denegado: El recurso no pertenece a tu empresa o no existe.`,
        });
      }

      // Opcional: Guardar el recurso encontrado en req para ahorrar una consulta en el controlador
      (req as any).validatedResource = exists;

      next();
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error en la validación de propiedad de recurso." });
    }
  };
};
