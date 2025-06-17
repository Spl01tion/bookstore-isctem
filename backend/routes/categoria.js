import express from "express";
import { createCategoria, getAllCategorias, todasCategorias } from "../controllers/categoriaCtl.js";

const router = express.Router();

router.post('/find_categ', todasCategorias);
router.post('/criar_categ', createCategoria);
router.get('/categorias', getAllCategorias);


export default router;