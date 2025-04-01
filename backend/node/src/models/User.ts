import { get } from "http";

type UserEntity = {
    id?: string;
    name: string;
    email: string;
    password: string;
}

type UserReturn = {
    id: string;
    name: string;
    email: string;
}

interface IUserService {
    getUserById(id: number): Promise<UserReturn>;
    // createUser(user: UserEntity): Promise<UserEntity>;
}

export {
    UserEntity,
    IUserService,
    UserReturn
}