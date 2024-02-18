import { AppError } from "millez-lib-api";
import { AppDataSource } from "../data-source";
import User from "../models/user.model";

class UpdateUserWithActiveProfileIdService {
    public async execute(userId: string, profileId: string) {
        try {
            const userRespository = AppDataSource.getRepository(User);
            const user = await userRespository.findOneBy({ id: userId });
            if (!user) throw new AppError('API_ERRORS.USER_NOT_FOUND', 404);
            user.activeProfileId = profileId;
            await userRespository.save({...user});
            return user;
        } catch (error: any) {
            throw new AppError(error.message);
        }
    }
}

export default UpdateUserWithActiveProfileIdService;
