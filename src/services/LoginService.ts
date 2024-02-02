import { AppDataSource } from "../data-source";
import User from "../models/user.model";
import AppError from "../errors/AppError";
import { compare } from "bcryptjs";
import { ISignin } from "../routes/interfaces/signin.interface";
import { RabbitMqMessagesProducerService } from "./RabbitMqMessagesProducerService";
import { RabbitMqQueues } from "../enums/rabbitmq-queues.enum";
import { IGenerateSession } from "../routes/interfaces/generate-session.inteface";

class SigninService {
    public async execute({ email, password, keepLoggedIn }: ISignin) {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOneBy({ email });
        if (!user || !user.validated) throw new AppError('API_ERRORS.INCORRECT_EMAIL_PASSWORD_COMBINATION', 401);
        const passwordMatched = await compare(password, user.password);
        if (!passwordMatched) throw new AppError('API_ERRORS.INCORRECT_EMAIL_PASSWORD_COMBINATION', 401);
        const rabbitMqService = new RabbitMqMessagesProducerService();
        const tokenApiResponse = await rabbitMqService.sendDataToAPI<IGenerateSession>(
            { userId: user.id, keepLoggedIn },
            RabbitMqQueues.CREATE_SESSION
        );

        return tokenApiResponse;
    }
}

export default SigninService;