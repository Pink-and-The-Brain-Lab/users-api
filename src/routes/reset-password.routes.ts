import { NextFunction, Request, Response, Router } from "express";
import { IResetPassword } from "./interfaces/reset-password.interface";
import { RabbitMqMessagesProducerService } from "../services/RabbitMqMessagesProducerService";
import { RabbitMqQueues } from "../enums/rabbitmq-queues.enum";
import AppError from "../errors/AppError";
import { validateEmail } from "../utils/validate-email";

const resetPasswordRouter = Router();

resetPasswordRouter.post('/', async (request: Request<IResetPassword>, response: Response, next: NextFunction) => {
    try {
        const { email } = request.body;
        validateEmail(email);
        const rabbitMqService = new RabbitMqMessagesProducerService();
        const tokenApiResponse = await rabbitMqService.sendDataToAPI<string>(email, RabbitMqQueues.CREATE_TOKEN);
        if (tokenApiResponse.statusCode) throw new AppError(tokenApiResponse.message || '', tokenApiResponse.statusCode);
        return response.json(tokenApiResponse);
    } catch (error) {
        next(error)
    }
});

export default resetPasswordRouter;