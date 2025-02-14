import { NextFunction, Request, Response, Router } from "express";
import { IResetPassword } from "./interfaces/reset-password.interface";
import { RabbitMqQueues } from "../enums/rabbitmq-queues.enum";
import { IValidationTokenData } from "../services/interfaces/validation-token-data.interface";
import { AppError, RabbitMqManageConnection, RabbitMqMessagesProducerService, ValidateEmail } from "millez-lib-api";
import { RABBITMQ_HOST_URL } from "../constants/rabbitmq-host-url";
const generateNewTokenRouter = Router();

generateNewTokenRouter.post('/', async (request: Request<IResetPassword>, response: Response, next: NextFunction) => {
    try {
        const { email } = request.body;
        const validateEmail = new ValidateEmail().validate(email);
        if (!validateEmail) throw new AppError('API_ERRORS.INVALID_EMAIL');
        const connection = new RabbitMqManageConnection(RABBITMQ_HOST_URL);
        const rabbitMqService = new RabbitMqMessagesProducerService(connection);
        const tokenApiResponse = await rabbitMqService.sendDataToAPI<string, IValidationTokenData>(email, RabbitMqQueues.CREATE_TOKEN, RabbitMqQueues.USER_RESPONSE_QUEUE);
        if (tokenApiResponse.statusCode)
            throw new AppError(tokenApiResponse.message || 'Internal server error.', tokenApiResponse.statusCode);
        return response.json({ created: true });
    } catch (error) {
        next(error)
    }
});

export default generateNewTokenRouter;
