import type { Request, Response, NextFunction } from "express";

// [✔] Valida si un usuario con un cierto rol tiene permiso para realizar alguna acción
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({
        message: "Prohibido: No tienes permisos para realizar esta acción.",
      });
    }
    next();
  };
};
