import mongoose from "mongoose";
import { AppError } from "../utils/http.js";

export const naoEncontrado = (req, _res, next) => {
    next(new AppError(404, `Rota não encontrada: ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
    let status = err.status || 500;
    let message = err.message || "Erro interno do servidor";

    if (err instanceof mongoose.Error.ValidationError) {
        status = 400;
        message = Object.values(err.errors).map((e) => e.message).join("; ");
    } else if (err instanceof mongoose.Error.CastError) {
        status = 400;
        message = `Valor inválido para '${err.path}'`;
    } else if (err.code === 11000) {
        status = 409;
        message = `Já existe um registo com ${Object.keys(err.keyValue || {}).join(", ")} igual`;
    } else if (err.type === "entity.parse.failed") {
        status = 400;
        message = "JSON inválido no corpo do pedido";
    }

    if (status >= 500) {
        console.error(err);
        if (!(err instanceof AppError)) message = "Erro interno do servidor";
    }

    res.status(status).json({ code: status, message, data: null });
};
