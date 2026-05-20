import type { Request, Response } from "express";
import User from "../models/User.js";
import { PasswordHasher } from "../utils/PasswordHasher.js";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "../services/mail.service.js";

// Listar usuarios (solo activos por defecto)
export const getUsers = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const { includeInactive } = req.query;
    const filter: any = { company: companyId };
    if (includeInactive !== "true") {
      filter.active = true;
    }
    const users = await User.find(filter).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

export const createUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const companyId = (req as any).companyId;
    const { name, email, role } = req.body;

    // Verificar si el correo ya existe en la base de datos
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        message: "El correo electrónico ya está registrado en el sistema.",
      });
      return;
    }

    // Generar contraseña aleatoria y encriptala
    const generatedPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(generatedPassword, salt);

    // Crear el usuario
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      company: companyId,
    });

    await newUser.save();

    // Enviar el correo con la contraseña en texto plano (asíncrono, no traba la respuesta)
    sendWelcomeEmail(email, name, generatedPassword);

    // Devolvemos los datos del usuario sin la contraseña
    const { password, ...userWithoutPassword } = newUser.toObject();
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({ message: "Error al registrar el empleado", error });
  }
};

// Borrado Lógico (Desactivar)
export const deactivateUser = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const { id } = req.params;

    // Buscar al usuario validando pertenencia a la empresa
    const user = await User.findOne({ _id: id as string, company: companyId });

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado en tu empresa o no existe.",
      });
    }

    // Verificar si ya se encuentra desactivado
    if (!user.active) {
      return res.status(400).json({
        message: `El usuario ${user.name} ya se encuentra desactivado actualmente.`,
      });
    }

    // Proceder con la desactivación (Borrado Lógico)
    user.active = false;
    await user.save();

    res.json({ message: "Usuario desactivado correctamente", user });
  } catch (error) {
    res.status(500).json({ message: "Error al desactivar usuario" });
  }
};

// Borrado Físico (Eliminar de la DB)
export const deleteUserPhysical = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const requesterId = (req as any).user.id;
    if (requesterId === req.params.id) {
      return res.status(400).json({
        message: "No puedes eliminar tu propia cuenta administrativa.",
      });
    }

    const user = await User.findByIdAndDelete({
      _id: req.params.id,
      company: companyId,
    });
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Usuario eliminado físicamente de la base de datos" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const companyId = (req as any).companyId;
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Verificar si el nuevo correo ya está en uso por OTRO usuario
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        res.status(400).json({
          message: "El correo electrónico ya está en uso por otro usuario.",
        });
        return;
      }
    }

    // Actualizamos explícitamente solo los campos permitidos
    const updatedUser = await User.findOneAndUpdate(
      { _id: id, company: companyId },
      { name, email, role },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      res.status(404).json({
        message: "Usuario no encontrado o no pertenece a tu empresa.",
      });
      return;
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: "Error al actualizar el empleado", error });
  }
};
