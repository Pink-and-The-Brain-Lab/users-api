import { NextFunction, Request, Response, Router } from "express";
import { IResetPassword } from "./interfaces/reset-password.interface";
import { RabbitMqMessagesProducerService } from "../services/RabbitMqMessagesProducerService";
import AppError from "../errors/AppError";
import validateEmail from "../utils/validate-email";
import { RabbitMqQueues } from "../utils/rabbitmq-queues.enum";
import { IValidationTokenData } from "../services/interfaces/validation-token-data.interface";

const generateNewTokenRouter = Router();

generateNewTokenRouter.post('/', async (request: Request<IResetPassword>, response: Response, next: NextFunction) => {
    try {
        const { email } = request.body;
        validateEmail(email);
        const rabbitMqService = new RabbitMqMessagesProducerService();
        const tokenApiResponse: IValidationTokenData = await rabbitMqService.sendDatatoTokenAPI<string>(email, RabbitMqQueues.CREATE_TOKEN);
        if (tokenApiResponse.statusCode) throw new AppError(tokenApiResponse.message || '', tokenApiResponse.statusCode);
        return response.json({ created: true });
    } catch (error) {
        next(error)
    }
});

export default generateNewTokenRouter;