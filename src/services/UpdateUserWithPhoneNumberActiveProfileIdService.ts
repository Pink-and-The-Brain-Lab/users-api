import { AppDataSource } from "../data-source";
import AppError from "../errors/AppError";
import User from "../models/user.model";
import { IUpdateUserWithPhoneNumberAndActiveProfileId } from "./interfaces/update-user-with-phone-number-and-active-profile-id";

class UpdateUserWithPhoneNumberActiveProfileIdService {
    public async execute(userId: string, phoneNumber: string, profileId: string) {
        const userRespository = AppDataSource.getRepository(User);
        const user = await userRespository.findOneBy({ id: userId });
        if (!user) throw new AppError('API_ERRORS.USER_NOT_FOUND', 404);
        user.cellphoneNumber = phoneNumber;
        user.activeProfileId = profileId;
        await userRespository.save({...user});
        return user;
    }
}

export default UpdateUserWithPhoneNumberActiveProfileIdService;
