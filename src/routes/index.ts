import { Router } from "express";
import signupRouter from "./signup.routes";
import validationTokenRouter from "./validation-token.routes";
import generateNewTokenRouter from "./generate-new-token.routes";
import resetPasswordRouter from "./reset-password.routes";
import signinRouter from "./signin.routes";
import createPasswordRouter from "./create-password.routes";

const routes = Router();

routes.use('/sign-up', signupRouter);
routes.use('/token-validation', validationTokenRouter);
routes.use('/generate-new-token', generateNewTokenRouter);
routes.use('/sign-in', signinRouter);
routes.use('/reset-password', resetPasswordRouter);
routes.use('/create-password', createPasswordRouter);

export default routes;