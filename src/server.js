import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import seedRoles from "./utils/seedRoles.js";
import seedUsers from "./utils/seedUsers.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

app.set("view engine", "ejs");
app.set("views", path.join(currentDirectory, "views"));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(currentDirectory, "public")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
    res.redirect("/signIn");
});

app.get("/signIn", (req, res) => {
    res.render("auth", { title: "Iniciar sesión", mode: "signIn" });
});

app.get("/signUp", (req, res) => {
    res.render("auth", { title: "Crear cuenta", mode: "signUp" });
});

// Las vistas cargan sus datos mediante la API protegida con JWT.
for (const view of ["dashboard", "profile", "admin"]) {
    app.get("/" + view, (req, res) => {
        res.set("Cache-Control", "no-store");
        res.render(view);
    });
}

app.get("/403", (req, res) => {
    res.status(403).render("error", {
        code: 403,
        title: "Acceso denegado",
        message: "Tu cuenta no tiene permisos para acceder a esta sección."
    });
});

app.get("/health", (req, res) => {
    res.json({ ok: true });
});

// Esta parte debe ir después de las rutas existentes.
app.use((req, res) => {
    if (req.path.startsWith("/api/")) {
        return res.status(404).json({
            message: "Ruta no encontrada."
        });
    }

    res.status(404).render("error", {
        code: 404,
        title: "Página no encontrada",
        message: "La dirección que ingresaste no existe."
    });
});

app.use((error, req, res, next) => {
    if (error.code === 11000) {
        return res.status(409).json({
            message: "Ya existe un registro con esos datos."
        });
    }

    if (
        error.name === "ValidationError" ||
        error.name === "CastError"
    ) {
        return res.status(400).json({
            message: "Revisa los datos enviados: hay campos inválidos."
        });
    }

    const status = error.status || 500;

    if (status >= 500) console.error(error);

    res.status(status).json({
        message: status >= 500
            ? "Ocurrió un error interno en el servidor."
            : error.message
    });
});

async function iniciarServidor() {
    try {
        if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
            throw new Error(
                "Falta MONGODB_URI o JWT_SECRET en el archivo .env"
            );
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB conectado correctamente");

        await seedRoles();
        await seedUsers();

        const server = app.listen(PORT, () => {
            console.log(`Servidor funcionando en http://localhost:${PORT}`);
        });

        server.on("error", (error) => {
            console.error("Error al iniciar el servidor:", error.message);
            process.exit(1);
        });
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
}

iniciarServidor();