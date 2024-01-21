import { NextFunction, Request, Response, Router } from "express";
import { IResetPassword } from "./interfaces/reset-password.interface";
import { RabbitMqMessagesProducerService } from "../services/RabbitMqMessagesProducerService";
import AppError from "../errors/AppError";
import validateEmail from "../utils/validate-email";

const generateNewTokenRouter = Router();

generateNewTokenRouter.post('/', async (request: Request<IResetPassword>, response: Response, next: NextFunction) => {
    try {
        const { email } = request.body;
        validateEmail(email);
        const rabbitMqService = new RabbitMqMessagesProducerService();
        const tokenApiResponse = await rabbitMqService.sendEmailtoTokenAPI(email);
        if (tokenApiResponse.statusCode) throw new AppError(tokenApiResponse.message, tokenApiResponse.statusCode);
        return response.json(tokenApiResponse);
    } catch (error: any) {
        next(error)
    }
});

export default generateNewTokenRouter;