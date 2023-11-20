import { NextFunction, Request, Response, Router } from "express";
import { ISignup } from './interfaces/signup.interface';
import CreateUserService from "../services/CreateUserService";

const signupRouter = Router();

signupRouter.post('/', async (request: Request<ISignup>, response: Response, next: NextFunction) => {
    try {
        const { email, name, password, confirmPassword, allowZellimCommunicate, recieveInformation } = request.body;
        const createUser = new CreateUserService();
        const user = await createUser.execute({email, name, password, confirmPassword, allowZellimCommunicate, recieveInformation});
        // @ts-ignore
        delete user.password;
        return response.json(user);    
    } catch (error) {
        next(error)
    }
});

export default signupRouter;