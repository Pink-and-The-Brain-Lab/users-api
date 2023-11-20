import { hash } from "bcryptjs";
import { AppDataSource } from "../data-source";
import User from "../models/user.model";
import { ISignup } from "../routes/interfaces/signup.interface";
import AppError from "../errors/AppError";
import CreateValidationTokenService from "./CreateValidationTokenService";
import validateEmail from "../utils/validate-email";
import validatePassword from "../utils/validate-password";

class CreateUserService {
    public async execute({ email, name, password, confirmPassword, allowZellimCommunicate, recieveInformation }: ISignup) {
        validateEmail(email);
        validatePassword(password, confirmPassword);
        const userRespository = AppDataSource.getRepository(User);
        const isEmailRegistered = await userRespository.findOneBy({ email: email });
        if (isEmailRegistered) throw new AppError('This email was registered. Please use another email');
        const hashedPassword = await hash(password, 8);
        
        const user = userRespository.create({
            email,
            name,
            password: hashedPassword,
            allowZellimCommunicate,
            recieveInformation,
            validated: false,
        });

        await userRespository.save(user);
        await this.generateValidationToken(email);
        return user;
    }

    private async generateValidationToken(email: string) {
        const tokenService = new CreateValidationTokenService();
        return await tokenService.execute(email);
    }
}

export default CreateUserService;