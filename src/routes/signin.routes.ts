import { NextFunction, Request, Response, Router } from "express";
import SigninService from "../services/LoginService";
import { ISignin } from "./interfaces/signin.interface";

const signinRouter = Router();

signinRouter.post('/', async (request: Request<ISignin>, response: Response, next: NextFunction) => {
    try {
        const { email, password, keepLoggedIn } = request.body;
        const signinService = new SigninService();
        const login = await signinService.execute({ email, password, keepLoggedIn });
        return response.json(login);
    } catch (error) {
        next(error)
    }
});

export default signinRouter;