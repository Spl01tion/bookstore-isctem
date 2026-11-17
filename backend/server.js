import { config } from "./config/env.js"; // tem de ser o primeiro import (carrega o .env)
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { buildAdminRouter } from "./config/setup.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import categoriaRoutes from "./routes/categoria.js";
import livroRoutes from "./routes/livro.js";
import encomendaRoutes from "./routes/encomenda.js";
import { errorHandler, naoEncontrado } from "./middleware/errorHandler.js";

const app = express();

app.use(
    cors({
        origin: config.corsOrigin === "*" ? true : config.corsOrigin.split(",").map((o) => o.trim()),
    })
);

// O AdminJS tem o seu próprio parser de formulários, por isso entra antes do express.json()
const adminRouter = buildAdminRouter();
if (adminRouter) app.use("/admin", adminRouter);

app.use(express.json({ limit: "1mb" }));

// Rotas da API (o frontend usa EXPO_PUBLIC_API_ENDPOINT = http://<ip>:8080/bookstore)
const api = express.Router();
api.use("/auth", authRoutes);
api.use("/users", userRoutes);
api.use("/categories", categoriaRoutes);
api.use("/books", livroRoutes);
api.use("/orders", encomendaRoutes);
api.get("/health", (_req, res) => res.json({ code: 200, message: "OK", data: { uptime: process.uptime() } }));
app.use(config.apiPrefix, api);

app.get("/", (_req, res) => res.send("Server is Ready"));

app.use(naoEncontrado);
app.use(errorHandler);

// Só aceita pedidos depois de a base de dados estar ligada
await connectDB();
app.listen(config.port, () => {
    console.log(`Servidor em http://localhost:${config.port}${config.apiPrefix}`);
    if (adminRouter) console.log(`Painel admin em http://localhost:${config.port}/admin`);
});
