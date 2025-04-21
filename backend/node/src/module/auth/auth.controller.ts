// src/module/auth/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import authServices from "./auth.service";
import userServices from "../user/user.service";

require("dotenv").config();

class AuthController {
    public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { username, password, email } = req.body;
        const user = { username, password, email };
        try {
            const registerStatus = await authServices.register(user);
            res.status(201).send(registerStatus);
        } catch (error) {
            next(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        const user = req.body;
        try {
            const loginStatus = await authServices.login(user);
            res.status(200).send(loginStatus);
        } catch (error) {
            next(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    public async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
        const user = req.user?.id; // Thêm kiểm tra null cho req.user
        try {
            if (!user) {
                res.status(401).json({ message: "Unauthorized" });
            }
            const me = await userServices.getUserById(user);
            res.status(200).send(me);
        } catch (error) {
            next(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

const authController = new AuthController();
export default authController;