import express from "express";
import {
    actualizarEstado,
    criarEncomenda,
    encomendaPorId,
    encomendasDoUtilizador,
    todasEncomendas,
} from "../controllers/encomendaCtl.js";
import { autenticar, autorizar } from "../middleware/auth.js";

const router = express.Router();

router.use(autenticar); // todas as rotas de encomendas exigem sessão

router.post("/", criarEncomenda);
router.get("/", autorizar("admin"), todasEncomendas);
router.get("/list/user/:userId", encomendasDoUtilizador);
router.get("/:id", encomendaPorId);
router.patch("/:id/status", autorizar("admin"), actualizarEstado);

export default router;
