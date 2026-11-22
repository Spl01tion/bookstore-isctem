import express from "express";
import {
    livroPorCategoriaID, getAllLivros, searchLivros, createLivro, updateLivro,
    getFavoriteBooks, addFavoriteBook, removeFavoriteBook,
} from "../controllers/livroCtl.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();
const router = express.Router();

// Todas as rotas de livros exigem sessão iniciada
router.get("/livros", verifyToken, getAllLivros);
router.post("/search", verifyToken, searchLivros);
router.post("/livro/:categoriaId", verifyToken, livroPorCategoriaID);

// Favoritos do utilizador autenticado
router.get("/fav", verifyToken, getFavoriteBooks);
router.post("/addfav", verifyToken, addFavoriteBook);
router.delete("/delfav/:livroId", verifyToken, removeFavoriteBook);

// Gestão de livros: apenas admin
router.post("/createLivro", verifyToken, requireRole("admin"), createLivro);
router.put("/updateLivro/:id", verifyToken, requireRole("admin"), updateLivro);

export default router;
