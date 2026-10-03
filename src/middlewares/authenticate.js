import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import UserRepository from "../repositories/UserRepository.js";

export default async function authenticate(req, res, next) {
    const authorization = req.get("Authorization") || "";
    const match = authorization.match(/^Bearer\s+(\S+)$/i);

    if (!match) {
        return res.status(401).json({
            message: "Debes iniciar sesión."
        });
    }

    let payload;

    try {
        payload = jwt.verify(
            match[1],
            process.env.JWT_SECRET,
            { algorithms: ["HS256"] }
        );
    } catch (error) {
        return res.status(401).json({
            message:
                error.name === "TokenExpiredError"
                    ? "Tu sesión ha vencido. Inicia sesión nuevamente."
                    : "Token inválido. Inicia sesión nuevamente."
        });
    }

    if (
        typeof payload.sub !== "string" ||
        !mongoose.isObjectIdOrHexString(payload.sub)
    ) {
        return res.status(401).json({
            message: "El token no identifica a un usuario válido."
        });
    }

    try {
        const usuario = await UserRepository.findById(payload.sub);

        if (!usuario) {
            return res.status(401).json({
                message: "La cuenta ya no existe."
            });
        }

        req.userId = usuario._id.toString();
        req.userRoles = usuario.roles.map((rol) => rol.name);

        next();
    } catch (error) {
        next(error);
    }
}