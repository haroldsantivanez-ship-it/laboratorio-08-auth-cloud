export default function authorize(requiredRoles = []) {
    return (req, res, next) => {
        if (!req.userId) {
            return res.status(401).json({
                message: "Debes iniciar sesión."
            });
        }

        const tienePermiso =
            requiredRoles.length === 0 ||
            requiredRoles.some((rol) =>
                (req.userRoles || []).includes(rol)
            );

        if (!tienePermiso) {
            return res.status(403).json({
                message: "No tienes permisos para acceder a esta sección."
            });
        }

        next();
    };
}