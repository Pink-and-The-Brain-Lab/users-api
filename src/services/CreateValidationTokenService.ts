import { AppDataSource } from "../data-source";
import ValidationToken from "../models/validation-token.model";

class CreateValidationTokenService {
    public async execute(email: string) {
        const tokenRepository = AppDataSource.getRepository(ValidationToken);
        let token = '';
        const tokenSize = 6;
        const currentDateInMilliseconds = new Date().getTime();
        const fiveMinuteInMilliseconds = 5 * 60 * 1000;
        
        for (let i = 0; i < tokenSize; i++ ) {
            token += Math.round(Math.random() * 9);
        }

        const tokenData = tokenRepository.create({
            token,
            email,
            validateTokenTime: new Date(currentDateInMilliseconds + fiveMinuteInMilliseconds),
            createdAt: new Date(currentDateInMilliseconds),
            validated: false,
        });

        await tokenRepository.save(tokenData);
        return tokenData;
    }
}

export default CreateValidationTokenService;