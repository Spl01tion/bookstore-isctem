import express from "express";
import {
    actualizarLivro,
    criarLivro,
    listarLivros,
    livroPorCategoriaID,
    livroPorId,
    livroPorSlug,
    removerLivro,
} from "../controllers/livroCtl.js";
import { autenticar, autorizar } from "../middleware/auth.js";

const router = express.Router();
const admin = [autenticar, autorizar("admin")];

router.get("/list", listarLivros);
router.get("/slug/:slug", livroPorSlug);
router.get("/category/:categoriaId", livroPorCategoriaID);
router.get("/:id", livroPorId);

router.post("/", ...admin, criarLivro);
router.put("/:id", ...admin, actualizarLivro);
router.delete("/:id", ...admin, removerLivro);

export default router;
