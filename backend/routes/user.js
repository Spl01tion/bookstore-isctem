import express from "express";
import { loginOrSignUp, createProfile, redefinirSenha, getAllUsers } from "../controllers/userCtl.js";

const router = express.Router();

router.post('/login', loginOrSignUp);
router.post('/signup', createProfile);
router.get('/users', getAllUsers);
router.post('/redefinir-senha', redefinirSenha);
export default router;