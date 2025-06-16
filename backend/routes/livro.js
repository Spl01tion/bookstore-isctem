import express from "express";

import { livroPorCategoriaID, createLivro, getAllLivros } from "../controllers/livroCtl.js";

const router = express.Router();

router.get("/livros", getAllLivros);
router.post("/createLivro", createLivro);
router.post("/:categoriaId", livroPorCategoriaID);


export default router;