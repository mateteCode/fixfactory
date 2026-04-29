import bcrypt from "bcryptjs";

export class PasswordHasher {
  // Encriptar contraseña
  static async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  // Comparar contraseña ingresada con la guardada
  static async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
