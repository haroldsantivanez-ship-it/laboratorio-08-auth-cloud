import { Router } from "express";
import AuthController from "../controllers/AuthController.js";

const router = Router();

router.post("/signUp", AuthController.signUp);
router.post("/signIn", AuthController.signIn);

export default router;