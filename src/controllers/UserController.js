import UserService from "../services/UserService.js";

class UserController {
    async getAll(req, res, next) {
        try {
            res.json(await UserService.getAll());
        } catch (error) {
            next(error);
        }
    }

    async getMe(req, res, next) {
        try {
            res.json(await UserService.getById(req.userId));
        } catch (error) {
            next(error);
        }
    }

    async updateMe(req, res, next) {
        try {
            const user = await UserService.updateProfile(
                req.userId,
                req.body
            );

            res.json({
                message: "Perfil actualizado correctamente.",
                user
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            res.json(await UserService.getById(req.params.id));
        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();