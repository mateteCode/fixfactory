import { PasswordHasher } from "../../src/utils/PasswordHasher.js";

describe("Pruebas Unitarias: PasswordHasher", () => {
  it("Debería encriptar una contraseña devolviendo un hash distinto al texto original", async () => {
    const rawPassword = "MiPasswordSeguro123";
    const hashedPassword = await PasswordHasher.hash(rawPassword);

    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toBe(rawPassword);
    expect(hashedPassword.length).toBeGreaterThan(20);
  });

  it("Debería retornar TRUE al comparar la contraseña correcta con su hash", async () => {
    const rawPassword = "AdminPassword!";
    const hashedPassword = await PasswordHasher.hash(rawPassword);

    const isMatch = await PasswordHasher.compare(rawPassword, hashedPassword);
    expect(isMatch).toBe(true);
  });

  it("Debería retornar FALSE al comparar una contraseña incorrecta", async () => {
    const rawPassword = "AdminPassword!";
    const hashedPassword = await PasswordHasher.hash(rawPassword);

    const isMatch = await PasswordHasher.compare(
      "PasswordFalso",
      hashedPassword,
    );
    expect(isMatch).toBe(false);
  });
});
