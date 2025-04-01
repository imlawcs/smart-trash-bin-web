import { IUserService } from "../models/User";
import UserSchema from "../schema/UserSchema";
import { UserReturn } from "../models/User";

class UserService implements IUserService {
    async getUserById(id: number): Promise<UserReturn> {
        const user = await UserSchema.findById(id);
        if (!user) {
            throw new Error("User not found");
        }
        return {
            id: user._id.toString(),
            email: user.email,
            name: user.name
        }
    }
}

export default new UserService();