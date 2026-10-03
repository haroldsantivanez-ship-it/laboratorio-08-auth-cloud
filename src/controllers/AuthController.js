import AuthService from "../services/AuthService.js";

class AuthController {
    async signUp(req, res, next) {
        try {
            const resultado = await AuthService.signUp(req.body);
            res.status(201).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async signIn(req, res, next) {
        try {
            const resultado = await AuthService.signIn(req.body);
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }
}

export default new AuthController();