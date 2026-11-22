import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import session from "express-session";
import ConnectMongoDBSession from "connect-mongodb-session";
import Livro from "../models/livroModel";
import Categoria from "../models/categoriaModel";
import User from "../models/userModel";
import AdminJSMongoose from "@adminjs/mongoose";
import {COOKIE_PASSWORD} from "../config.js";
import { dark, light ,noSidebar} from "@adminjs/themes";

AdminJS.registerAdapter(AdminJSMongoose);

const DEFAULT_ADMIN ={
    email: "admin@admin.com",
    password: "admin"
}

