import { NextFunction, Request, Response, Router } from "express";
import { ICreatePassword } from "./interfaces/create-password.interface";
import CreatePasswordService from "../services/CreatePasswordService";
import { validateEmail } from "../utils/validate-email";
import { validatePassword } from "../utils/validate-password";

const createPasswordRouter = Router();

createPasswordRouter.post('/', async (request: Request<ICreatePassword>, response: Response, next: NextFunction) => {
    try {
        const { email, password, confirmPassword } = request.body;
        validateEmail(email);
        validatePassword(password, confirmPassword);
        const createPasswordService = new CreatePasswordService();
        await createPasswordService.execute({email, password} as ICreatePassword);
        return response.json({ success: true });
    } catch (error) {
        next(error)
    }
});

export default createPasswordRouter;