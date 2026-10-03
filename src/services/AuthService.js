import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserRepository from "../repositories/UserRepository.js";
import RoleRepository from "../repositories/RoleRepository.js";

function crearError(message, status = 400) {
    const error = new Error(message);
    error.status = status;
    return error;
}

class AuthService {
    async signUp(data) {
        const {
            name,
            lastName,
            phoneNumber,
            birthdate,
            email,
            password
        } = data;

        const campos = { name, lastName, phoneNumber, birthdate, email };

        for (const [campo, valor] of Object.entries(campos)) {
            if (typeof valor !== "string" || !valor.trim()) {
                throw crearError(`El campo ${campo} es obligatorio.`);
            }
        }

        const correo = email.trim().toLowerCase();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            throw crearError("Ingresa un correo válido.");
        }

        const passwordValida =
            typeof password === "string" &&
            password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[#$%&*@]/.test(password);

        if (!passwordValida) {
            throw crearError(
                "La contraseña debe tener mínimo 8 caracteres, " +
                "una mayúscula, un número y un símbolo: # $ % & * @."
            );
        }

        if (Buffer.byteLength(password, "utf8") > 72) {
            throw crearError("La contraseña es demasiado larga.");
        }

        const fecha = new Date(birthdate);

        if (Number.isNaN(fecha.getTime()) || fecha > new Date()) {
            throw crearError("Ingresa una fecha de nacimiento válida.");
        }

        const existe = await UserRepository.findByEmail(correo);

        if (existe) {
            throw crearError("Este correo ya está registrado.", 409);
        }

        const rol = await RoleRepository.findByName("user");

        if (!rol) {
            throw crearError("No se encontró el rol de usuario.", 500);
        }

        const passwordHash = await bcrypt.hash(
            password,
            Number(process.env.BCRYPT_SALT_ROUNDS || 10)
        );

        const usuario = await UserRepository.create({
            name: name.trim(),
            lastName: lastName.trim(),
            phoneNumber: phoneNumber.trim(),
            birthdate: fecha,
            email: correo,
            password: passwordHash,
            roles: [rol._id]
        });

        return {
            message: "Usuario registrado correctamente.",
            user: {
                id: usuario._id,
                name: usuario.name,
                email: usuario.email
            }
        };
    }

    async signIn(data) {
        const { email, password } = data;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            throw crearError("Ingresa tu correo y contraseña.");
        }

        const usuario = await UserRepository.findForLogin(
            email.trim().toLowerCase()
        );

        if (!usuario) {
            throw crearError("Correo o contraseña incorrectos.", 401);
        }

        const coincide = await bcrypt.compare(password, usuario.password);

        if (!coincide) {
            throw crearError("Correo o contraseña incorrectos.", 401);
        }

        const roles = usuario.roles.map((rol) => rol.name);

        const token = jwt.sign(
            {
                sub: usuario._id.toString(),
                roles
            },
            process.env.JWT_SECRET,
            {
                algorithm: "HS256",
                expiresIn: process.env.JWT_EXPIRES_IN || "1h"
            }
        );

        return {
            token,
            user: {
                id: usuario._id,
                name: usuario.name,
                lastName: usuario.lastName,
                email: usuario.email,
                roles
            }
        };
    }
}

export default new AuthService();