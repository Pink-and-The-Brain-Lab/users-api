import { AppError } from "millez-lib-api";
import { AppDataSource } from "../data-source";
import User from "../models/user.model";

class CheckPhoneNumberDiponibilityService {
    public async execute(userId: string, phoneNumber: string) {
        try {
            const userRespository = AppDataSource.getRepository(User);
            const user = await userRespository.findOneBy({ cellphoneNumber: phoneNumber });
            return !(user && user?.id === userId);
        } catch (error: any) {
            throw new AppError(error.message);
        }
    }
}

export default CheckPhoneNumberDiponibilityService;