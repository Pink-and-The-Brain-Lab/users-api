import { NextFunction, Request, Response, Router } from "express";
import { IResetPassword } from "./interfaces/reset-password.interface";
import { RabbitMqQueues } from "../enums/rabbitmq-queues.enum";
import { validateEmail } from "../utils/validate-email";
import { AppError, RabbitMqManageConnection, RabbitMqMessagesProducerService } from "millez-lib-api";
import { IValidationTokenData } from "../services/interfaces/validation-token-data.interface";

const resetPasswordRouter = Router();

resetPasswordRouter.post('/', async (request: Request<IResetPassword>, response: Response, next: NextFunction) => {
    try {
        const { email } = request.body;
        validateEmail(email);
        const connection = new RabbitMqManageConnection('amqp://localhost');
        const rabbitMqService = new RabbitMqMessagesProducerService(connection);
        const tokenApiResponse = await rabbitMqService.sendDataToAPI<string, IValidationTokenData>(email, RabbitMqQueues.CREATE_TOKEN, RabbitMqQueues.USER_RESPONSE_QUEUE);
        if (tokenApiResponse.statusCode) throw new AppError(tokenApiResponse.message || '', tokenApiResponse.statusCode);
        return response.json(tokenApiResponse);
    } catch (error) {
        next(error)
    }
});

export default resetPasswordRouter;