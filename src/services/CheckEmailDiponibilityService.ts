import { AppDataSource } from "../data-source";
import User from "../models/user.model";

class CheckEmailDiponibilityService {
    public async execute(userId: string, email: string) {
        const userRespository = AppDataSource.getRepository(User);
        const user = await userRespository.findOneBy({ email });
        return !user || user.id === userId;
    }
}

export default CheckEmailDiponibilityService;