import express from "express";
import { livroPorCategoriaID } from "../controllers/livroCtl.js";

const router=express.Router();

router.post("/:categoriaId", livroPorCategoriaID);

export default router;