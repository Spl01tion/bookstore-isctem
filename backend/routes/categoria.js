import express from "express";
import { todasCategorias, getAllCategorias, createCategoria } from "../controllers/categoriaCtl.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get('/categorias', verifyToken, getAllCategorias);
router.post('/categorias', verifyToken, requireRole('admin'), createCategoria);
router.post('/categoria', verifyToken, todasCategorias); // rota original

export default router;
