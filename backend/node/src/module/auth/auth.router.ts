// src/module/auth/auth.router.ts
import express from "express";
import controller from './auth.controller';
import auth from '../../middlewares/authMiddleware';

const router = express.Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/me", auth.authenticateToken, controller.getMe);

export default router;