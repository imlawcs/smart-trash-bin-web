import customError from "../../error/customError";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import UserSchema from "../../schema/UserSchema";
import { UserEntity, UserReturn } from "../../models/User";


dotenv.config();

const jwtSecret = process.env.JWT_SECRET || 'abc';

interface IUser {
    username: string;
    password: string;
    email: string;
    // fullname: string;
}

class AuthService {
    async register(user: IUser): Promise<{ status: number; message: string, token: string, user: UserReturn }> {
        try {
            if (!user.username || !user.password || !user.email) 
                throw new customError(400, 'No empty fields');

            const userExist : UserEntity | null = await UserSchema.findOne({ name: user.username });
            if (userExist) {
                throw new customError(409, 'Username already exists');
            }

            // Hash the password
            const saltRound = 10;
            const hashedPassword = await bcrypt.hash(user.password, saltRound);

            user.password = hashedPassword;

            const newUser : UserEntity = {
                name: user.username,
                password: user.password,
                email: user.email,
            }

            await UserSchema.create(newUser);

            const userExistAfterCreate = await UserSchema.findOne({ email: user.email });
            if (userExistAfterCreate === null) {
                throw new customError(404, 'Invalid username or password');
            }

            const userReturn : UserReturn = {
                id: userExistAfterCreate._id.toString(),
                name: userExistAfterCreate.name,
                email: userExistAfterCreate.email
            }

            const userId = userExistAfterCreate.id;
            const token = jwt.sign({ id: userId }, jwtSecret, { expiresIn: '1h' });
            return {
                status: 201,
                message: 'Register successfully',
                token: token, 
                user: userReturn
            };
        } catch (error) {
            throw error;
        }
    }

    async login(user: { email: string; password: string }): Promise<{ status: number; message: string; token: string, user: UserReturn }> {
        try {
            if (!user.email || !user.password)
                throw new customError(400, 'No empty fields');

            const userExist = await UserSchema.findOne({ email: user.email });
            if (userExist === null) {
                throw new customError(404, 'Invalid username or password');
            }

            const userReturn : UserReturn = {
                id: userExist._id.toString(),
                name: userExist.name,
                email: userExist.email
            }

            const passwordMatch = await bcrypt.compare(user.password, userExist.password);

            if (!passwordMatch) 
                throw new customError(400, 'Invalid username or password');
            else {
                const userId = userExist.id;
                const token = jwt.sign({ id: userId }, jwtSecret, { expiresIn: '1h' });
                return {
                    status: 200,
                    message: 'Login successfully',
                    token: token, 
                    user: userReturn
                };
            }
        } catch (error) {
            throw error;
        }
    }
}

const authService = new AuthService();

export default authService;
