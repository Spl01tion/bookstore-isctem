import express from "express";
import { register, login, refresh, profile, redefinirSenha } from "../controllers/userCtl.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.post('/register', register);
router.post('/signup', register); // nome usado pelo frontend
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/profile', verifyToken, profile);
router.post('/redefinir-senha', verifyToken, requireRole('admin'), redefinirSenha);

export default router;
