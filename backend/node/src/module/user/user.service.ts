import { IUserService, UserReturn } from "../../models/User";
import UserSchema from "../../schema/UserSchema";

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