import express from "express";
import {
    actualizarCategoria,
    categoriaPorSlug,
    criarCategoria,
    removerCategoria,
    todasCategorias,
} from "../controllers/categoriaCtl.js";
import { autenticar, autorizar } from "../middleware/auth.js";

const router = express.Router();
const admin = [autenticar, autorizar("admin")];

router.get("/", todasCategorias);
router.get("/:slug", categoriaPorSlug);
router.post("/", ...admin, criarCategoria);
router.put("/:id", ...admin, actualizarCategoria);
router.delete("/:id", ...admin, removerCategoria);

export default router;
