import { NextFunction, Request, Response, Router } from "express";
import CreateValidationTokenService from "../services/CreateValidationTokenService";

const generateNewTokenRouter = Router();

generateNewTokenRouter.post('/', async (request: Request, response: Response, next: NextFunction) => {
    try {
        const { email } = request.body;
        const createValidationTokenService = new CreateValidationTokenService();
        await createValidationTokenService.execute(email);
        return response.json({ created: true });
    } catch (error) {
        next(error)
    }
});

export default generateNewTokenRouter;