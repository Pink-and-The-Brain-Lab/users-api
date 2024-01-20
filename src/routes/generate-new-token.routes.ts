import { NextFunction, Request, Response, Router } from "express";
import { IResetPassword } from "./interfaces/reset-password.interface";
import { RabbitMqMessagesProducerService } from "../services/RabbitMqMessagesProducerService";

const generateNewTokenRouter = Router();

generateNewTokenRouter.post('/', async (request: Request<IResetPassword>, response: Response, next: NextFunction) => {
    try {
        const { email } = request.body;
        const rabbitMqService = new RabbitMqMessagesProducerService();
        await rabbitMqService.sendEmailtoTokenAPI(email);
        return response.json({ "created": true });
    } catch (error) {
        next(error)
    }
});

export default generateNewTokenRouter;