import type { Request, Response } from "express";
import Company, { CompanyPlan } from "../models/Company.js";
import User, { UserRole } from "../models/User.js";
import { PasswordHasher } from "../utils/PasswordHasher.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendPasswordResetEmail } from "../services/mail.service.js";

// [!] Registrar un usuario con contraseña elegida
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
      company: companyId,
    });
    await newUser.save();

    res.status(201).json({ message: "Usuario creado con éxito" });
  } catch (error) {
    res.status(400).json({ message: "Error en el registro", error });
  }
};

// [✔] Loguearse con un usuario, devuelve un token de 8hs con información del usuario y compañia
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

    if (!user.active) {
      return res.status(403).json({
        message: "Tu cuenta está desactivada. Contacta al Asistente de RRHH.",
      });
    }

    const company = await Company.findById(user.company);

    // Generar el Token con el Rol y la Compañía
    const token = jwt.sign(
      { id: user._id, role: user.role, company: company?._id || user.company },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "8h" },
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        company: company?._id || user.company,
        companyName: company?.name || "Empresa desconocida",
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// [✔] Registrar una compañia y su usuario ADMIN
export const registerCompany = async (req: Request, res: Response) => {
  try {
    const { companyName, adminName, email, password } = req.body;

    // Validaciones de que no exista la compañia ni el usuario
    const existingCompany = await Company.findOne({ name: companyName });
    if (existingCompany)
      return res.status(400).json({ message: "La empresa ya existe" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "El email ya está en uso" });

    // Generar IDs por adelantado
    const companyId = new mongoose.Types.ObjectId();
    const adminId = new mongoose.Types.ObjectId();

    // Creamos al Admin con el ID de la empresa ya asignado
    const hashedPassword = await PasswordHasher.hash(password);
    const newAdmin = new User({
      _id: adminId,
      name: adminName,
      email,
      password: hashedPassword,
      role: UserRole.ADMIN,
      company: companyId,
    });

    // Creamos la empresa con el ID del admin como owner
    const newCompany = new Company({
      _id: companyId,
      name: companyName,
      owner: adminId,
      plan: CompanyPlan.FREE,
    });

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

export const changePassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).user.id; // Viene del token JWT
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    // Verificar contraseña actual
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "La contraseña actual es incorrecta" });
      return;
    }

    // Encriptar y guardar la nueva
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al cambiar la contraseña", error });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Por seguridad, no decimos si el email existe o no, damos el mismo mensaje
      res.status(200).json({
        message: "Si el correo existe, se enviará un enlace de recuperación.",
      });
      return;
    }

    // Generar un token aleatorio seguro
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Guardar el token hasheado en la base de datos (por seguridad extra) y darle 1 hora de vida
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    await user.save();

    // Enviar el token original sin hashear por correo
    await sendPasswordResetEmail(user.email, resetToken);

    res.status(200).json({
      message: "Si el correo existe, se enviará un enlace de recuperación.",
    });
  } catch (error) {
    res.status(500).json({ message: "Error al procesar la solicitud", error });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Hasheamos el token que viene de la URL para compararlo con el de la base de datos
    const hashedToken = crypto
      .createHash("sha256")
      .update(token as string)
      .digest("hex");

    // Buscamos al usuario que tenga ese token y que no haya expirado
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }, // $gt = Greater Than (Mayor a ahora)
    });

    if (!user) {
      res.status(400).json({ message: "El token es inválido o ha expirado" });
      return;
    }

    // Encriptar y guardar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Limpiar los campos de recuperación para que el token no se pueda reusar
    user.resetPasswordToken = "";
    user.resetPasswordExpire = new Date();
    await user.save();

    res.status(200).json({
      message:
        "Contraseña restablecida exitosamente. Ya puedes iniciar sesión.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al restablecer la contraseña", error });
  }
};
