import { NextFunction, Request, Response, Router } from "express";
import { IResetPassword } from "./interfaces/reset-password.interface";
import validateEmail from "../utils/validate-email";
import { RabbitMqMessagesProducerService } from "../services/RabbitMqMessagesProducerService";
import { RabbitMqQueues } from "../utils/rabbitmq-queues.enum";
import AppError from "../errors/AppError";

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