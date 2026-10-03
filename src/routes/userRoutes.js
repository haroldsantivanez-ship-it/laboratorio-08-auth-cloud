import { Router } from "express";
import UserController from "../controllers/UserController.js";
import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";

const router = Router();

// Todas estas rutas requieren una sesión válida.
router.use(authenticate);

// Cada persona consulta y modifica su propio perfil.
router.get("/me", UserController.getMe);
router.patch("/me", UserController.updateMe);

// Solo el administrador puede consultar a otros usuarios.
router.get("/", authorize(["admin"]), UserController.getAll);
router.get("/:id", authorize(["admin"]), UserController.getById);

export default router;