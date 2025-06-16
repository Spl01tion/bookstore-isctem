import express from "express";
import { loginOrSignUp, createProfile, getAllUsers } from "../controllers/userCtl.js";

const router = express.Router();

router.post('/login', loginOrSignUp);
router.post('/signup', createProfile);
router.get('/users', getAllUsers);

export default router;