import { AppError } from "millez-lib-api";
import { AppDataSource } from "../data-source";
import User from "../models/user.model";

class UpdateUserWithPhoneNumberService {
    public async execute(userId: string, phoneNumber: string) {
        try {
            console.log('UpdateUserWithPhoneNumberService', userId, phoneNumber)
            const userRespository = AppDataSource.getRepository(User);
            const user = await userRespository.findOneBy({ id: userId });
            if (!user) throw new AppError('API_ERRORS.USER_NOT_FOUND', 404);
            user.cellphoneNumber = phoneNumber;
            await userRespository.save({...user});
            return { cellphoneNumber: user.cellphoneNumber };
        } catch (error: any) {
            throw new AppError(error.message);
        }
    }
}

export default UpdateUserWithPhoneNumberService;
