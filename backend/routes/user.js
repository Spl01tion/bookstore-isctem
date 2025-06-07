import express from "express";
import { loginOrSignUp } from "../controllers/userCtl";

const router = express.Router();

router.post('/login',loginOrSignUp);

export default router;