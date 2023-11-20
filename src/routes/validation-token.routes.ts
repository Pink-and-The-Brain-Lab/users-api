import { NextFunction, Request, Response, Router } from "express";
import { IValidationToken } from "./interfaces/validation-token.interface";
import ValidationTokenService from "../services/ValidationTokenService";
import UpdateUserWhenTokenWasValidatedService from "../services/UpdateUserWhenTokenWasValidatedService";
import { ValidationTokenEnum } from "../enums/validation-token-origin.enum";

const validationTokenRouter = Router();

validationTokenRouter.post('/', async (request: Request<IValidationToken>, response: Response, next: NextFunction) => {
    try {
        const { token, origin } = request.body;
        const validationTokenService = new ValidationTokenService();
        await validationTokenService.execute({ token });
        if (origin === ValidationTokenEnum.SIGNUP) await updateUser(token.email);
        return response.json({ validated: true });
    } catch (error) {
        next(error)
    }
});

async function updateUser(email: string) {
    const updateUser = new UpdateUserWhenTokenWasValidatedService();
    return await updateUser.execute(email);
}

export default validationTokenRouter;