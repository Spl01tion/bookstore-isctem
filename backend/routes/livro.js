import express from "express";

import { livroPorCategoriaID, createLivro, updateLivro, removeFavoriteBook, getAllLivros, getFavoriteBooks, searchLivros, addFavoriteBook } from "../controllers/livroCtl.js";

const router = express.Router();

router.get("/livros", getAllLivros);
router.post("/search", searchLivros);
router.get("/fav", getFavoriteBooks);
router.post("/addfav", addFavoriteBook);
router.post("/createLivro", createLivro);
router.post("/:categoriaId", livroPorCategoriaID);
router.delete('/delfav/:livroId', removeFavoriteBook);
router.put('/updateLivro/:id', updateLivro);
export default router;

