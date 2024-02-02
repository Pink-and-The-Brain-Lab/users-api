import { hash } from "bcryptjs";
import { AppDataSource } from "../data-source";
import User from "../models/user.model";
import { ISignup } from "../routes/interfaces/signup.interface";
import AppError from "../errors/AppError";
import { RabbitMqMessagesProducerService } from "./RabbitMqMessagesProducerService";
import { RabbitMqQueues } from "../enums/rabbitmq-queues.enum";
import { validateEmail } from "../utils/validate-email";
import { validatePassword } from "../utils/validate-password";

class CreateUserService {
    public async execute({ email, name, password, confirmPassword, allowZellimCommunicate, recieveInformation }: ISignup) {
        validateEmail(email);
        validatePassword(password, confirmPassword);
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
        });

        await userRespository.save(user);
        const rabbitMqService = new RabbitMqMessagesProducerService();
        const tokenApiResponse = await rabbitMqService.sendDataToAPI<string>(email, RabbitMqQueues.CREATE_TOKEN);
        if (tokenApiResponse.statusCode) throw new AppError(tokenApiResponse.message || '', tokenApiResponse.statusCode);
        return user;
    }   
}

export default CreateUserService;