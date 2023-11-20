import { AppDataSource } from "../data-source";
import AppError from "../errors/AppError";
import User from "../models/user.model";

class UpdateUserWhenTokenWasValidatedService {
    public async execute(email: string) {
        const userRespository = AppDataSource.getRepository(User);
        const user = await userRespository.findOneBy({ email: email });
        if (!user) throw new AppError('user not found', 404);
        user.validated = true
        await userRespository.save({...user});
        return user;
    }
}

export default UpdateUserWhenTokenWasValidatedService;