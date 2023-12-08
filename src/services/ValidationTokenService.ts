import { AppDataSource } from "../data-source";
import ValidationToken from "../models/validation-token.model";
import { IValidationToken } from "../routes/interfaces/validation-token.interface";
import AppError from "../errors/AppError";

class ValidationTokenService {
    public async execute({ token }: IValidationToken) {
        const tokenRepository = AppDataSource.getRepository(ValidationToken);
        const registeredToken = await tokenRepository.findOneBy({ token });
        if (!registeredToken) throw new AppError('TOKEN_NOT_FOUND', 404);
        const currentDateInMilliseconds = new Date().getTime();
        const validateTokenTime = new Date(registeredToken.validateTokenTime).getTime();
        if (currentDateInMilliseconds > validateTokenTime || registeredToken.validated) throw new AppError('API_ERRORS.TOKEN_EXPIRED');
        registeredToken.validated = true;
        await tokenRepository.save(registeredToken);
        return token;
    }
}

export default ValidationTokenService;