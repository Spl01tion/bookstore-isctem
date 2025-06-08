import express from "express";
import { loginOrSignUp } from "../controllers/userCtl.js";

const router = express.Router();

router.post('/login',loginOrSignUp);

export default router;