import express from "express";
import {
    actualizarPerfil,
    adicionarEndereco,
    adicionarFavorito,
    alterarSenha,
    listarFavoritos,
    listarUtilizadores,
    perfil,
    redefinirSenha,
    registar,
    removerEndereco,
    removerFavorito,
} from "../controllers/userCtl.js";
import { autenticar, autorizar } from "../middleware/auth.js";

const router = express.Router();
const admin = [autenticar, autorizar("admin")];

router.post("/add", registar);

router.get("/me", autenticar, perfil);
router.put("/me", autenticar, actualizarPerfil);
router.put("/me/password", autenticar, alterarSenha);
router.post("/me/addresses", autenticar, adicionarEndereco);
router.delete("/me/addresses/:addressId", autenticar, removerEndereco);

router.get("/me/favorites", autenticar, listarFavoritos);
router.post("/me/favorites", autenticar, adicionarFavorito);
router.delete("/me/favorites/:livroId", autenticar, removerFavorito);

router.get("/", ...admin, listarUtilizadores);
router.put("/:id/password", ...admin, redefinirSenha);

export default router;
