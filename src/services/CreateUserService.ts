import { hash } from "bcryptjs";
import { AppDataSource } from "../data-source";
import User from "../models/user.model";
import { ISignup } from "../routes/interfaces/signup.interface";
import { RabbitMqQueues } from "../enums/rabbitmq-queues.enum";
import { AppError, RabbitMqManageConnection, RabbitMqMessagesProducerService, ValidateEmail, ValidatePassword } from "millez-lib-api";
import { IValidationTokenData } from "./interfaces/validation-token-data.interface";
import { RABBITMQ_HOST_URL } from "../constants/rabbitmq-host-url";
import { ICheckEmailDisponibility } from "./interfaces/check-email-disponibility.interface";
import { IProfile } from "./interfaces/proifle.inteface";

class CreateUserService {
    public async execute({ email, name, password, confirmPassword, allowZellimCommunicate, recieveInformation }: ISignup) {
        const validateEmail = new ValidateEmail().validate(email);
        if (!validateEmail) throw new AppError('API_ERRORS.INVALID_EMAIL');
        const validatePassword = new ValidatePassword(8).validate(password, confirmPassword);
        if (validatePassword.length) throw new AppError(validatePassword);
        const userRespository = AppDataSource.getRepository(User);
        const isEmailRegistered = await userRespository.findOneBy({ email: email });
        if (isEmailRegistered) throw new AppError('API_ERRORS.THIS_EMAIL_WAS_REGISTERED_PLEASE_USE_ANOTHER_EMAIL');
        const hashedPassword = await hash(password, 8);
        
        const user = userRespository.create({
            email,
            name,
            password: hashedPassword,
            allowZellimCommunicate,
            recieveInformation,
            validated: false,
            activeProfileId: '',
            cellphoneNumber: '',
        });

        await userRespository.save(user);
        const connection = new RabbitMqManageConnection(RABBITMQ_HOST_URL);
        const rabbitMqService = new RabbitMqMessagesProducerService(connection);
        await this.createToken(rabbitMqService, email);
        await this.validateProfile(rabbitMqService, user);
        return user;
    }
    
    private async createToken(rabbitMqService: RabbitMqMessagesProducerService, email: string) {
        const tokenApiResponse = await rabbitMqService.sendDataToAPI<string, IValidationTokenData>(
            email,
            RabbitMqQueues.CREATE_TOKEN,
            RabbitMqQueues.USER_RESPONSE_QUEUE
        );
        if (tokenApiResponse.statusCode)
            throw new AppError(tokenApiResponse.message || 'Internal server error.', tokenApiResponse.statusCode);
    }

    private async validateProfile(rabbitMqService: RabbitMqMessagesProducerService, user: User) {
        const userData: ICheckEmailDisponibility = { userId: user.id, email: user.email };
        const profile = await rabbitMqService.sendDataToAPI<ICheckEmailDisponibility, IProfile>(
            userData,
            RabbitMqQueues.CREATE_PROFILE_AFTER_SIGNUP,
            RabbitMqQueues.USER_RESPONSE_QUEUE
        );
        if (profile.statusCode)
            throw new AppError(profile.message || 'Internal server error.', profile.statusCode);
    }
}

export default CreateUserService;