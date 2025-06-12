import express from "express";
import { todasCategorias } from "../controllers/categoriaCtl.js";

const router = express.Router();

router.post('/', todasCategorias);

export default router;