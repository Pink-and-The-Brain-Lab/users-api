import { AppDataSource } from "../data-source";
import User from "../models/user.model";
import AppError from "../errors/AppError";
import { compare } from "bcryptjs";
import authConfig from '../config/auth';
import { sign } from "jsonwebtoken";
import { ISignin } from "../routes/interfaces/signin.interface";

class SigninService {
    public async execute({ email, password }: ISignin) {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOneBy({ email });
        if (!user || !user.validated) throw new AppError('API_ERRORS.INCORRECT_EMAIL_PASSWORD_COMBINATION', 401);
        const passwordMatched = await compare(password, user.password);
        if (!passwordMatched) throw new AppError('API_ERRORS.INCORRECT_EMAIL_PASSWORD_COMBINATION', 401);
        const { secret, expiresIn } = authConfig.jwt;
        const token = sign({}, secret, {
            subject: user.id,
            expiresIn,
        });
        
        // @ts-ignore
        delete user.password;
        // @ts-ignore
        delete user.allowZellimCommunicate;
        // @ts-ignore
        delete user.recieveInformation;

        return { user, token };
    }
}

export default SigninService;