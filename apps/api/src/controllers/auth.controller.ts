import type { Request, Response } from "express";
import Company from "../models/Company.js";
import User from "../models/User.js";
import { PasswordHasher } from "../utils/PasswordHasher.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;
    const companyId = (req as any).companyId;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    //  Hashear la contraseña
    const hashedPassword = await PasswordHasher.hash(password);

    // Crear nuevo usuario
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      company: companyId, // Asignación automática y segura
    });
    await newUser.save();

    res.status(201).json({ message: "Usuario creado con éxito" });
  } catch (error) {
    res.status(400).json({ message: "Error en el registro", error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate("company");

    if (
      !user ||
      !(await PasswordHasher.compare(password, user.password || ""))
    ) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    if (!user.active) {
      return res.status(403).json({
        message: "Tu cuenta está desactivada. Contacta al Asistente de RRHH.",
      });
    }

    // Generar el Token con el Rol y la Compañía
    const token = jwt.sign(
      { id: user._id, role: user.role, company: user.company },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "8h" },
    );
    const company = await Company.findById(user.company);

    res.json({
      token,
      /* // WARNING: Se cambio la estructura del json para que funcione en el front. Verificar que no afecte al backend
      id: user._id,
      companyId: user.company,
      role: user.role,
      name: user.name,
      */
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        company: user.company._id,
        companyName:
          user.company && (user.company as any).name
            ? (user.company as any).name
            : "Empresa desconocida",
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const registerCompany = async (req: Request, res: Response) => {
  try {
    const { companyName, adminName, email, password } = req.body;

    // 1. Validaciones previas
    const existingCompany = await Company.findOne({ name: companyName });
    if (existingCompany)
      return res.status(400).json({ message: "La empresa ya existe" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "El email ya está en uso" });

    // 2. GENERAR IDs POR ADELANTADO
    const companyId = new mongoose.Types.ObjectId();
    const adminId = new mongoose.Types.ObjectId();

    // 3. CREAR EL ADMIN (con el ID de la empresa ya asignado)
    const hashedPassword = await PasswordHasher.hash(password);
    const newAdmin = new User({
      _id: adminId,
      name: adminName,
      email,
      password: hashedPassword,
      role: "ADMIN",
      company: companyId, // Ahora sí tiene el ID requerido
    });

    // 4. CREAR LA EMPRESA (con el ID del admin como owner)
    const newCompany = new Company({
      _id: companyId,
      name: companyName,
      owner: adminId,
      plan: "FREE",
    });

    // 5. GUARDAR AMBOS (El orden ya no rompe la validación)
    await newAdmin.save();
    await newCompany.save();

    res.status(201).json({
      message: "Empresa y Administrador registrados con éxito",
      company: companyName,
      admin: adminName,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error en el registro maestro", error: error.message });
  }
};
