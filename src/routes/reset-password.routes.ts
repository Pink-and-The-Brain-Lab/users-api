import { NextFunction, Request, Response, Router } from "express";
import { IResetPassword } from "./interfaces/reset-password.interface";
import validateEmail from "../utils/validate-email";
// import CreateValidationTokenService from "../services/CreateValidationTokenService";

const resetPasswordRouter = Router();

resetPasswordRouter.post('/', async (request: Request<IResetPassword>, response: Response, next: NextFunction) => {
    try {
        const { email } = request.body;
        validateEmail(email);
        // const tokenService = new CreateValidationTokenService();
        // await tokenService.execute(email);
        return response.json({ success: true });
    } catch (error) {
        next(error)
    }
});

export default resetPasswordRouter;