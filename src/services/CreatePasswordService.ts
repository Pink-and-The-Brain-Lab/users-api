import { AppDataSource } from "../data-source";
import User from "../models/user.model";
import AppError from "../errors/AppError";
import { compare, hash } from "bcryptjs";
import { ICreatePassword } from "../routes/interfaces/create-password.interface";

class CreatePasswordService {
    public async execute({ email, password }: ICreatePassword) {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOneBy({ email });
        if (!user) throw new AppError('Error to save new password!', 401);
        const newPassword = await hash(password, 8);
        const passwordMatched = await compare(password, user.password);
        if (passwordMatched) throw new AppError('New password and old password can not be equals!', 401)
        user.password = newPassword;
        userRepository.save({...user});
        return true;
    }
}

export default CreatePasswordService;