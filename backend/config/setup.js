// Painel de administração AdminJS em /admin
// Só entram utilizadores com role "admin" (criar o primeiro com: npm run seed)
import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import * as AdminJSMongoose from "@adminjs/mongoose";
import session from "express-session";
import ConnectMongoDBSession from "connect-mongodb-session";
import { dark, light } from "@adminjs/themes";

import Livro from "../models/livroModel.js";
import Categoria from "../models/categoriaModel.js";
import User from "../models/userModel.js";
import Encomenda from "../models/encomendaModel.js";
import { config } from "./env.js";

AdminJS.registerAdapter({ Resource: AdminJSMongoose.Resource, Database: AdminJSMongoose.Database });

const authenticate = async (email, password) => {
    const identificador = String(email).toLowerCase().trim();
    const user = await User.findOne({ $or: [{ email: identificador }, { username: identificador }] }).select("+password");
    if (!user || user.role !== "admin" || !user.isActive) return null;
    if (!(await user.compararSenha(String(password)))) return null;
    return { email: user.email, title: user.name, id: user._id.toString() };
};

export const buildAdminRouter = () => {
    if (!config.cookiePassword) {
        console.warn("COOKIE_PASSWORD não definido: painel /admin desactivado");
        return null;
    }

    const admin = new AdminJS({
        rootPath: "/admin",
        branding: { companyName: "BookStore ISCTEM", withMadeWithLove: false },
        defaultTheme: light.id,
        availableThemes: [light, dark],
        resources: [
            { resource: Livro, options: { navigation: { name: "Loja" }, properties: { descricao: { type: "textarea" } } } },
            { resource: Categoria, options: { navigation: { name: "Loja" } } },
            { resource: Encomenda, options: { navigation: { name: "Loja" } } },
            {
                resource: User,
                options: {
                    navigation: { name: "Utilizadores" },
                    // A senha nunca é mostrada nem editada aqui (o update do AdminJS não passa pelo hash)
                    properties: { password: { isVisible: false } },
                    // Contas novas são criadas pela app (POST /users/add); aqui só se gere role/estado
                    actions: { new: { isAccessible: false } },
                },
            },
        ],
    });

    const MongoStore = ConnectMongoDBSession(session);
    const store = new MongoStore({ uri: process.env.MONGO_URI, collection: "admin_sessions" });
    store.on("error", (err) => console.error("Erro na sessão do AdminJS:", err.message));

    return AdminJSExpress.buildAuthenticatedRouter(
        admin,
        { authenticate, cookieName: "bookstore_admin", cookiePassword: config.cookiePassword },
        null,
        {
            store,
            resave: false,
            saveUninitialized: false,
            secret: config.cookiePassword,
            cookie: { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 1000 * 60 * 60 * 8 },
            name: "bookstore_admin",
        }
    );
};
