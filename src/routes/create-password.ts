import { NextFunction, Request, Response, Router } from "express";
import { ICreatePassword } from "./interfaces/create-password.interface";
import CreatePasswordService from "../services/CreatePasswordService";
import { AppError, ValidateEmail, ValidatePassword } from "millez-lib-api";
const createPasswordRouter = Router();

createPasswordRouter.post('/', async (request: Request<ICreatePassword>, response: Response, next: NextFunction) => {
    try {
        const { email, password, confirmPassword } = request.body;
        const validateEmail = new ValidateEmail().validate(email);
        if (!validateEmail) throw new AppError('API_ERRORS.INVALID_EMAIL');
        const validatePassword = new ValidatePassword(8).validate(password, confirmPassword);
        if (validatePassword.length) throw new AppError(validatePassword);
        const createPasswordService = new CreatePasswordService();
        await createPasswordService.execute({email, password} as ICreatePassword);
        return response.json({ success: true });
    } catch (error) {
        next(error)
    }
});

export default createPasswordRouter;
