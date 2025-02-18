import { NextFunction, Request, Response, Router } from "express";
import { IValidateToken } from "./interfaces/validate-token.interface";
import { RabbitMqQueues } from "../enums/rabbitmq-queues.enum";
import UpdateUserWhenTokenWasValidatedService from "../services/UpdateUserWhenTokenWasValidatedService";
import { IValidationTokenData } from "../services/interfaces/validation-token-data.interface";
import { AppError, RabbitMqManageConnection, RabbitMqMessagesProducerService } from "millez-lib-api";
import { RABBITMQ_HOST_URL } from "../constants/rabbitmq-host-url";
const validationTokenRouter = Router();

validationTokenRouter.post('/', async (request: Request<IValidateToken>, response: Response, next: NextFunction) => {
    try {
        const { token } = request.body;
        const connection = new RabbitMqManageConnection(RABBITMQ_HOST_URL);
        const rabbitMqService = new RabbitMqMessagesProducerService(connection);
        const tokenApiResponse = await rabbitMqService.sendDataToAPI<string, IValidationTokenData>(token, RabbitMqQueues.VALIDATE_TOKEN, RabbitMqQueues.USER_RESPONSE_QUEUE);
        if (tokenApiResponse.statusCode)
            throw new AppError(tokenApiResponse.message || 'Internal server error.', tokenApiResponse.statusCode);
        const updateUser = new UpdateUserWhenTokenWasValidatedService();
        await updateUser.execute(tokenApiResponse.email as string);
        return response.json({ validated: true });
    } catch (error) {
        next(error)
    }
});

export default validationTokenRouter;
