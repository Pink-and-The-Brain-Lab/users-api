import { AppError } from "millez-lib-api";
import { AppDataSource } from "../data-source";
import User from "../models/user.model";

class UpdateUserWhenTokenWasValidatedService {
    public async execute(email: string) {
        const userRespository = AppDataSource.getRepository(User);
        const user = await userRespository.findOneBy({ email: email });
        if (!user) throw new AppError('API_ERRORS.USER_NOT_FOUND', 404);
        user.validated = true
        await userRespository.save({...user});
        return user;
    }
}

export default UpdateUserWhenTokenWasValidatedService;