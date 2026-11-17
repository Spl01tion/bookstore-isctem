import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { config } from "../config/env.js";
import { AppError, ok } from "../utils/http.js";

export const generateTokens = (user) => {
    const payload = { userId: user._id.toString(), role: user.role };
    const accessToken = jwt.sign(payload, config.accessSecret, { expiresIn: config.accessExpires });
    const refreshToken = jwt.sign({ userId: payload.userId }, config.refreshSecret, { expiresIn: config.refreshExpires });
    return { accessToken, refreshToken };
};

// POST /auth/login  { username, password }  (username pode ser o email)
export const login = async (req, res) => {
    const { username, password } = req.body ?? {};
    if (!username || !password) throw new AppError(400, "Nome de utilizador e senha são obrigatórios");

    const identificador = String(username).toLowerCase().trim();
    const user = await User.findOne({ $or: [{ username: identificador }, { email: identificador }] }).select("+password");

    // Mensagem genérica: não revela se o utilizador existe
    if (!user || !(await user.compararSenha(String(password)))) {
        throw new AppError(401, "Credenciais inválidas");
    }
    if (!user.isActive) throw new AppError(403, "Conta desactivada");

    const { accessToken, refreshToken } = generateTokens(user);
    ok(res, { token: accessToken, refreshToken, authenticated: true }, "Sessão iniciada");
};

// POST /auth/refresh  { refreshToken }
export const refresh = async (req, res) => {
    const { refreshToken } = req.body ?? {};
    if (!refreshToken) throw new AppError(400, "refreshToken em falta");

    let payload;
    try {
        payload = jwt.verify(refreshToken, config.refreshSecret);
    } catch {
        throw new AppError(401, "Refresh token inválido ou expirado");
    }

    const user = await User.findById(payload.userId);
    if (!user || !user.isActive) throw new AppError(401, "Utilizador não encontrado ou inactivo");

    const tokens = generateTokens(user);
    ok(res, { token: tokens.accessToken, refreshToken: tokens.refreshToken, authenticated: true }, "Token renovado");
};
