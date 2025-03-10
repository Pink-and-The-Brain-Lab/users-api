import { AppDataSource } from "../data-source";
import User from "../models/user.model";
import { compare, hash } from "bcryptjs";
import { ICreatePassword } from "../routes/interfaces/create-password.interface";
import { AppError } from "millez-lib-api";

class CreatePasswordService {
    public async execute({ email, password }: ICreatePassword) {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOneBy({ email });
        if (!user) throw new AppError('API_ERRORS.ERROR_TO_SAVE_NEW_PASSWORD', 401);
        const newPassword = await hash(password, 8);
        const passwordMatched = await compare(password, user.password);
        if (passwordMatched) throw new AppError('API_ERRORS.NEW_PASSWORD_AND_OLD_PASSWORD_CAN_NOT_BE_EQUALS', 401);
        user.password = newPassword;
        userRepository.save({...user});
        return true;
    }
}

export default CreatePasswordService;
