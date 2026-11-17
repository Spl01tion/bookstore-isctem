import dotenv from "dotenv";

// Carregado antes de qualquer outro módulo que leia process.env
dotenv.config();

const obrigatorias = ["MONGO_URI", "ACCESS_TOKEN_SECRET", "REFRESH_TOKEN_SECRET"];
const emFalta = obrigatorias.filter((k) => !process.env[k]);

if (emFalta.length) {
    console.error(`Variáveis de ambiente em falta: ${emFalta.join(", ")}. Ver .env.example`);
    process.exit(1);
}

export const config = {
    port: Number(process.env.PORT) || 8080,
    apiPrefix: process.env.API_PREFIX ?? "/bookstore",
    accessSecret: process.env.ACCESS_TOKEN_SECRET,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
    accessExpires: process.env.ACCESS_TOKEN_EXPIRES || "2d",
    refreshExpires: process.env.REFRESH_TOKEN_EXPIRES || "7d",
    cookiePassword: process.env.COOKIE_PASSWORD,
    corsOrigin: process.env.CORS_ORIGIN || "*",
};
