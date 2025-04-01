import { Request, Response, NextFunction } from "express";
import authServices from "./auth.service";
import userServices from "../user/user.service";

require("dotenv").config();

class AuthController {
    public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { username, password, email} = req.body;
        const user = { username, password, email};
        try {
            const registerStatus = await authServices.register(user);
            res.status(201).send(registerStatus);
        } catch (error) {
            next(error);
        }
    }

    public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        const user = req.body;
        try {
            const loginStatus = await authServices.login(user);
            res.status(200).send(loginStatus);
        } catch (error) {
            next(error);
        }
    }
    
    public async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
        const user = req.user.id;
        try {
            const me = await userServices.getUserById(user);
            res.status(200).send(me);
        } catch (error) {
            next(error);
        }
    }
}

const authController = new AuthController();
export default authController;
