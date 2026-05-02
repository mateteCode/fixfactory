import type { Request, Response, NextFunction } from "express";

export const checkTenant = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = (req as any).user;

  if (!user || !user.company) {
    return res.status(403).json({
      message: "No se encontró una empresa vinculada a este usuario.",
    });
  }

  // Guardamos la compañía en una variable fácil de acceder
  (req as any).companyId = user.company;
  next();
};
