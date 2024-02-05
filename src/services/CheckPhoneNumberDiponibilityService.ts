import { AppDataSource } from "../data-source";
import User from "../models/user.model";

class CheckPhoneNumberDiponibilityService {
    public async execute(userId: string, phoneNumber: string) {
        const userRespository = AppDataSource.getRepository(User);
        const user = await userRespository.findOneBy({ cellphoneNumber: phoneNumber });
        return !user || user.id === userId;
    }
}

export default CheckPhoneNumberDiponibilityService;