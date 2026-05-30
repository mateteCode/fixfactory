import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// [✔] Verifica el token lo decodifica y lo inserta en el req
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")[1]; // Espera "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: "Acceso denegado. No hay token." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
    (req as any).user = decoded; // Guardamos los datos del usuario en la petición
    next();
  } catch (error) {
    res.status(401).json({ message: "Token no válido o expirado." });
  }
};
