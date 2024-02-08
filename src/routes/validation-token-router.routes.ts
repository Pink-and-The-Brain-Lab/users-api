import { NextFunction, Request, Response, Router } from "express";
import AppError from "../errors/AppError";
import { IValidateToken } from "./interfaces/validate-token.interface";
import { RabbitMqQueues } from "../enums/rabbitmq-queues.enum";
import UpdateUserWhenTokenWasValidatedService from "../services/UpdateUserWhenTokenWasValidatedService";
import { IValidationTokenData } from "../services/interfaces/validation-token-data.interface";
import { RabbitMqManageConnection, RabbitMqMessagesProducerService } from "millez-lib-api";

const validationTokenRouter = Router();

validationTokenRouter.post('/', async (request: Request<IValidateToken>, response: Response, next: NextFunction) => {
    try {
        const { token } = request.body;
        const connection = new RabbitMqManageConnection('amqp://localhost');
        const rabbitMqService = new RabbitMqMessagesProducerService(connection);
        const tokenApiResponse = await rabbitMqService.sendDataToAPI<string, IValidationTokenData>(token, RabbitMqQueues.CREATE_TOKEN, RabbitMqQueues.USER_RESPONSE_QUEUE);
        if (tokenApiResponse.statusCode) throw new AppError(tokenApiResponse.message || '', tokenApiResponse.statusCode);
        await updateUser(tokenApiResponse.email || '');
        return response.json({ validated: true });
    } catch (error) {
        next(error)
    }
});

async function updateUser(email: string) {
    const updateUser = new UpdateUserWhenTokenWasValidatedService();
    return await updateUser.execute(email);
}

export default validationTokenRouter;