import mongoose from "mongoose";
import UserRepository from "../repositories/UserRepository.js";

function crearError(message, status = 400) {
    const error = new Error(message);
    error.status = status;
    return error;
}

function datosPublicos(usuario) {
    return {
        id: usuario._id.toString(),
        name: usuario.name,
        lastName: usuario.lastName,
        email: usuario.email,
        phoneNumber: usuario.phoneNumber,
        birthdate: usuario.birthdate,
        age: usuario.age,
        url_profile: usuario.url_profile,
        address: usuario.address,
        roles: usuario.roles.map((rol) => rol.name),
        createdAt: usuario.createdAt,
        updatedAt: usuario.updatedAt
    };
}

class UserService {
    async getAll() {
        const usuarios = await UserRepository.getAll();
        return usuarios.map(datosPublicos);
    }

    async getById(id) {
        if (!mongoose.isObjectIdOrHexString(id)) {
            throw crearError("Identificador inválido.");
        }

        const usuario = await UserRepository.findById(id);

        if (!usuario) {
            throw crearError("Usuario no encontrado.", 404);
        }

        return datosPublicos(usuario);
    }

    async updateProfile(id, data) {
        // Solo permitimos modificar los datos personales.
        const permitidos = [
            "name",
            "lastName",
            "email",
            "phoneNumber",
            "birthdate",
            "url_profile",
            "address"
        ];

        const cambios = {};

        for (const campo of permitidos) {
            if (data[campo] !== undefined) {
                if (typeof data[campo] !== "string") {
                    throw crearError(`El campo ${campo} debe ser texto.`);
                }

                cambios[campo] = data[campo].trim();
            }
        }

        const obligatorios = [
            "name",
            "lastName",
            "email",
            "phoneNumber",
            "birthdate"
        ];

        for (const campo of obligatorios) {
            if (cambios[campo] === "") {
                throw crearError(`El campo ${campo} es obligatorio.`);
            }
        }

        if (cambios.email !== undefined) {
            cambios.email = cambios.email.toLowerCase();

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cambios.email)) {
                throw crearError("Ingresa un correo válido.");
            }
        }

        if (cambios.birthdate !== undefined) {
            const fecha = new Date(cambios.birthdate);

            if (Number.isNaN(fecha.getTime()) || fecha > new Date()) {
                throw crearError("La fecha de nacimiento no es válida.");
            }

            cambios.birthdate = fecha;
        }

        if (cambios.url_profile) {
            let url;

            try {
                url = new URL(cambios.url_profile);
            } catch {
                throw crearError("La dirección de la imagen no es válida.");
            }

            if (!["http:", "https:"].includes(url.protocol)) {
                throw crearError("La imagen debe usar una URL HTTP o HTTPS.");
            }
        }

        if (Object.keys(cambios).length === 0) {
            throw crearError("No enviaste datos para actualizar.");
        }

        const usuario = await UserRepository.updateProfile(id, cambios);

        if (!usuario) {
            throw crearError("Usuario no encontrado.", 404);
        }

        return datosPublicos(usuario);
    }
}

export default new UserService();