import { AppDataSource } from "../data-source";
import User from "../models/user.model";
import { compare } from "bcryptjs";
import { ISignin } from "../routes/interfaces/signin.interface";
import { RabbitMqQueues } from "../enums/rabbitmq-queues.enum";
import { IGenerateSession } from "../routes/interfaces/generate-session.inteface";
import { AppError, RabbitMqManageConnection, RabbitMqMessagesProducerService } from "millez-lib-api";
import { IValidationTokenData } from "./interfaces/validation-token-data.interface";

class SigninService {
    public async execute({ email, password, keepLoggedIn }: ISignin) {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOneBy({ email });
        if (!user) throw new AppError('API_ERRORS.INCORRECT_EMAIL_PASSWORD_COMBINATION', 401);
        if (!user.validated) throw new AppError('API_ERRORS.USER_NOT_VALIDATED', 401);
        const passwordMatched = await compare(password, user.password);
        if (!passwordMatched) throw new AppError('API_ERRORS.INCORRECT_EMAIL_PASSWORD_COMBINATION', 401);
        const connection = new RabbitMqManageConnection('amqp://localhost');
        const rabbitMqService = new RabbitMqMessagesProducerService(connection);
        const tokenApiResponse = await rabbitMqService.sendDataToAPI<IGenerateSession, IValidationTokenData>(
            { userId: user.id, keepLoggedIn },
            RabbitMqQueues.CREATE_SESSION,
            RabbitMqQueues.USER_RESPONSE_QUEUE
        );

        return tokenApiResponse;
    }
}

export default SigninService;