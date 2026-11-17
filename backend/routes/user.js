import express from "express";
import {
    actualizarPerfil,
    adicionarEndereco,
    alterarSenha,
    listarUtilizadores,
    perfil,
    registar,
    removerEndereco,
} from "../controllers/userCtl.js";
import { autenticar, autorizar } from "../middleware/auth.js";

const router = express.Router();

router.post("/add", registar);

router.get("/me", autenticar, perfil);
router.put("/me", autenticar, actualizarPerfil);
router.put("/me/password", autenticar, alterarSenha);
router.post("/me/addresses", autenticar, adicionarEndereco);
router.delete("/me/addresses/:addressId", autenticar, removerEndereco);

router.get("/", autenticar, autorizar("admin"), listarUtilizadores);

export default router;
