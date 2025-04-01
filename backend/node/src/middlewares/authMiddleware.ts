import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { string } from 'joi';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET as string;

class AuthMiddleware {
    private getTokenFromHeader(req: Request, res: Response): string | void {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            res.status(401).send({ message: 'Unauthorized: No token provided' });
            return;
        }
        else {
            return token;
        }
    }

    private verifyToken(token: string, res: Response): JwtPayload | string | void {
        try {
            const decoded = jwt.verify(token, jwtSecret);
            return decoded;
        }
        catch (error) {
            res.status(401).send({ message: 'Unauthorized: Invalid token' });
            return;
        }
    }

    authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const token = this.getTokenFromHeader(req, res);
            if (!token) return;
            const decoded = this.verifyToken(token, res);
            if (!decoded || typeof decoded == 'string') return;
            req.user = decoded;
            next();
        }
        catch (error) {
            res.status(401).send({ message: 'Unauthorized: Invalid token' });
        }
    }

    authorize = (allowedRoleId: number[]) => {
        return (req: Request, res: Response, next: NextFunction): void => {
            const token = this.getTokenFromHeader(req, res);
            if (!token) return;

            const decoded = this.verifyToken(token, res);
            if (!decoded || typeof decoded == 'string') return;

            const roleId = decoded.role[0].roleId;
            if (!allowedRoleId.includes(roleId)) {
                res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
                return;
            }

            next();
        };
    }
}

const authMiddleware = new AuthMiddleware();

export default authMiddleware;
