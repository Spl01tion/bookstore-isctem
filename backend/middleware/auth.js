import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// Exige um access token válido no header: Authorization: Bearer <token>
export const verifyToken = async (req, res, next) => {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ success: false, message: "Token de acesso em falta" });
    }

    try {
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, { algorithms: ["HS256"] });
        if (payload.type !== "access" || !payload.userId) {
            return res.status(401).json({ success: false, message: "Token inválido" });
        }

        const user = await User.findById(payload.userId);
        if (!user) {
            return res.status(401).json({ success: false, message: "Utilizador já não existe" });
        }

        req.user = user;
        next();
    } catch (error) {
        const message = error.name === "TokenExpiredError" ? "Token expirado" : "Token inválido";
        return res.status(401).json({ success: false, message });
    }
};

// Usar depois de verifyToken, ex.: router.post('/x', verifyToken, requireRole('admin'), handler)
export const requireRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: "Sem permissão" });
    }
    next();
};
