import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { config } from "../config/env.js";
import { AppError } from "../utils/http.js";

// Exige "Authorization: Bearer <accessToken>" válido e coloca o utilizador em req.user
export const autenticar = async (req, _res, next) => {
    const [tipo, token] = (req.headers.authorization || "").split(" ");
    if (tipo !== "Bearer" || !token) throw new AppError(401, "Token de acesso em falta");

    let payload;
    try {
        payload = jwt.verify(token, config.accessSecret);
    } catch {
        throw new AppError(401, "Token inválido ou expirado");
    }

    const user = await User.findById(payload.userId);
    if (!user || !user.isActive) throw new AppError(401, "Utilizador não encontrado ou inactivo");

    req.user = user;
    next();
};

// Usar depois de autenticar: autorizar("admin")
export const autorizar = (...roles) => (req, _res, next) => {
    if (!roles.includes(req.user?.role)) throw new AppError(403, "Sem permissão para esta operação");
    next();
};
