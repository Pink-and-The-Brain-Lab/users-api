import { NextFunction, Request, Response, Router } from "express";
import { IResetPassword } from "./interfaces/reset-password.interface";
import AppError from "../errors/AppError";
import { RabbitMqQueues } from "../enums/rabbitmq-queues.enum";
import { IValidationTokenData } from "../services/interfaces/validation-token-data.interface";
import { validateEmail } from "../utils/validate-email";
import { RabbitMqManageConnection, RabbitMqMessagesProducerService } from "millez-lib-api";

const generateNewTokenRouter = Router();

generateNewTokenRouter.post('/', async (request: Request<IResetPassword>, response: Response, next: NextFunction) => {
    try {
        const { email } = request.body;
        validateEmail(email);
        const connection = new RabbitMqManageConnection('amqp://localhost');
        const rabbitMqService = new RabbitMqMessagesProducerService(connection);
        const tokenApiResponse = await rabbitMqService.sendDataToAPI<string, IValidationTokenData>(email, RabbitMqQueues.CREATE_TOKEN, RabbitMqQueues.USER_RESPONSE_QUEUE);
        if (tokenApiResponse.statusCode) throw new AppError(tokenApiResponse.message || '', tokenApiResponse.statusCode);
        return response.json({ created: true });
    } catch (error) {
        next(error)
    }
});

export default generateNewTokenRouter;