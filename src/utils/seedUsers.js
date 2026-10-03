import bcrypt from "bcrypt";
import User from "../models/User.js";
import Role from "../models/Role.js";

export default async function seedUsers() {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
        throw new Error("Falta ADMIN_EMAIL o ADMIN_PASSWORD en .env");
    }

    const existente = await User.findOne({ email }).populate("roles");

    if (existente) {
        const esAdmin = existente.roles.some(
            (rol) => rol.name === "admin"
        );

        if (!esAdmin) {
            throw new Error(
                "El correo del administrador pertenece a una cuenta user."
            );
        }

        console.log("Administrador inicial preparado correctamente");
        return;
    }

    const passwordValida =
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[#$%&*@]/.test(password) &&
        Buffer.byteLength(password, "utf8") <= 72;

    if (!passwordValida) {
        throw new Error(
            "ADMIN_PASSWORD no cumple los requisitos de contraseña."
        );
    }

    const rolAdmin = await Role.findOne({ name: "admin" });

    if (!rolAdmin) {
        throw new Error("No existe el rol admin.");
    }

    const passwordHash = await bcrypt.hash(
        password,
        Number(process.env.BCRYPT_SALT_ROUNDS || 10)
    );

    await User.create({
        name: "Administrador",
        lastName: "Laboratorio",
        email,
        password: passwordHash,
        phoneNumber: "999999999",
        birthdate: new Date("2000-01-01T00:00:00.000Z"),
        roles: [rolAdmin._id]
    });

    console.log("Administrador inicial creado correctamente");
}