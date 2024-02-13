import { AppError } from "millez-lib-api";
import { AppDataSource } from "../data-source";
import User from "../models/user.model";

class CheckEmailDiponibilityService {
    public async execute(userId: string, email: string) {
        try {
            console.log('CheckEmailDiponibilityService', userId, email)
            const userRespository = AppDataSource.getRepository(User);
            const user = await userRespository.findOneBy({ email });
            return !user || user.id === userId;
        } catch (error: any) {
            throw new AppError(error.message);
        }
    }
}

export default CheckEmailDiponibilityService;