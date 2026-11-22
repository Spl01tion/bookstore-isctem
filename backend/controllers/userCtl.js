import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || "15m";
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES || "7d";

const generateTokens = (user) => {
    const userId = user._id.toString();

    const accessToken = jwt.sign(
        { userId, role: user.role, type: "access" },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: ACCESS_EXPIRES, algorithm: "HS256" }
    );

    const refreshToken = jwt.sign(
        { userId, type: "refresh" },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: REFRESH_EXPIRES, algorithm: "HS256" }
    );

    return { accessToken, refreshToken };
};

// POST /register  (alias: /signup)
const register = async (req, res) => {
    const { name, email, password } = req.body ?? {};

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "Nome, email e password são obrigatórios" });
    }

    try {
        // O role NUNCA vem do cliente: novos registos são sempre 'user'
        const user = await User.create({ name, email, password, role: "user" });
        const tokens = generateTokens(user);

        res.status(201).json({ success: true, user, ...tokens });
    } catch (error) {
        if (error.code === 11000) {
            // Só é "email já registado" se o índice que falhou for o do email
            if (error.keyPattern?.email) {
                return res.status(409).json({ success: false, message: "Email já registado" });
            }
            console.error("Chave duplicada inesperada no registo:", error.keyPattern);
            return res.status(500).json({ success: false, message: "Erro ao registar utilizador" });
        }
        if (error.name === "ValidationError") {
            const message = Object.values(error.errors).map((e) => e.message).join(", ");
            return res.status(400).json({ success: false, message });
        }
        console.error(error);
        res.status(500).json({ success: false, message: "Erro ao registar utilizador" });
    }
};

// POST /login
const login = async (req, res) => {
    const { email, password } = req.body ?? {};

    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
        return res.status(400).json({ success: false, message: "Email e password são obrigatórios" });
    }

    try {
        const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

        // Mesma mensagem para email inexistente e password errada
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: "Credenciais inválidas" });
        }

        const tokens = generateTokens(user);
        res.status(200).json({ success: true, user, ...tokens });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Erro ao iniciar sessão" });
    }
};

// POST /refresh  { refreshToken }
const refresh = async (req, res) => {
    const { refreshToken } = req.body ?? {};

    if (!refreshToken) {
        return res.status(400).json({ success: false, message: "Refresh token em falta" });
    }

    try {
        const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, { algorithms: ["HS256"] });
        if (payload.type !== "refresh" || !payload.userId) {
            return res.status(401).json({ success: false, message: "Refresh token inválido" });
        }

        const user = await User.findById(payload.userId);
        if (!user) {
            return res.status(401).json({ success: false, message: "Utilizador já não existe" });
        }

        res.status(200).json({ success: true, ...generateTokens(user) });
    } catch (error) {
        const message = error.name === "TokenExpiredError" ? "Refresh token expirado" : "Refresh token inválido";
        res.status(401).json({ success: false, message });
    }
};

// GET /profile  (requer verifyToken)
const profile = (req, res) => {
    res.status(200).json({ success: true, user: req.user });
};

// POST /redefinir-senha  { email, novaSenha }  (apenas admin)
const redefinirSenha = async (req, res) => {
    const { email, novaSenha } = req.body ?? {};

    if (typeof email !== "string" || typeof novaSenha !== "string" || !email || !novaSenha) {
        return res.status(400).json({ success: false, message: "Email e nova senha são obrigatórios." });
    }
    if (novaSenha.length < 6) {
        return res.status(400).json({ success: false, message: "A nova senha deve ter pelo menos 6 caracteres." });
    }

    try {
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(404).json({ success: false, message: "Utilizador não encontrado." });
        }

        user.password = novaSenha; // o hook pre('save') do modelo aplica o hash bcrypt
        await user.save({ validateModifiedOnly: true });

        res.status(200).json({ success: true, message: `A senha de ${user.email} foi redefinida.` });
    } catch (error) {
        console.error("Erro ao redefinir senha:", error);
        res.status(500).json({ success: false, message: "Erro ao redefinir a senha." });
    }
};

export { register, login, refresh, profile, redefinirSenha };
