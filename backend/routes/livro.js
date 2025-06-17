import express from "express";

import { livroPorCategoriaID, createLivro, getAllLivros, getFavoriteBooks, searchLivros, addFavoriteBook } from "../controllers/livroCtl.js";

const router = express.Router();

router.get("/livros", getAllLivros);
router.post("/search", searchLivros);
router.get("/fav", getFavoriteBooks);
router.post("/addfav", addFavoriteBook);
router.post("/createLivro", createLivro);
router.post("/:categoriaId", livroPorCategoriaID);


export default router;