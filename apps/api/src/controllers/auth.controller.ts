import type { Request, Response } from "express";
import User from "../models/User.js";
import { PasswordHasher } from "../utils/PasswordHasher.js";
import jwt from "jsonwebtoken";
//import bcrypt from "bcryptjs";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    //  Hashear la contraseña
    const hashedPassword = await PasswordHasher.hash(password);

    // Crear nuevo usuario
    const newUser = new User({ ...req.body, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "Usuario creado con éxito" });
  } catch (error) {
    res.status(400).json({ message: "Error en el registro", error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (
      !user ||
      !(await PasswordHasher.compare(password, user.password || ""))
    ) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Generar el Token con el Rol y la Compañía
    const token = jwt.sign(
      { id: user._id, role: user.role, company: user.company },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "8h" },
    );

    res.json({ token, id: user._id, role: user.role, name: user.name });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};
