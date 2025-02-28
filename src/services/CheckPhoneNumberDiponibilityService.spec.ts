import { AppDataSource } from "../data-source";
import User from "../models/user.model";
import CheckPhoneNumberDiponibilityService from "../services/CheckPhoneNumberDiponibilityService";

jest.mock("../data-source", () => ({
    AppDataSource: {
        getRepository: jest.fn(),
    },
}));

describe("CheckPhoneNumberDiponibilityService", () => {
    const mockFindOneBy = jest.fn();
    const mockUserRepository = {
        findOneBy: mockFindOneBy,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepository);
    });

    it("should return true if no user is found with the given phone number", async () => {
        mockFindOneBy.mockResolvedValue(null);
        const service = new CheckPhoneNumberDiponibilityService();
        const result = await service.execute("user-id", "1234567890");
        expect(result).toBe(true);
        expect(AppDataSource.getRepository).toHaveBeenCalledWith(User);
        expect(mockFindOneBy).toHaveBeenCalledWith({ cellphoneNumber: "1234567890" });
    });

    it("should return false if the found user's ID matches the given userId", async () => {
        mockFindOneBy.mockResolvedValue({ id: "user-id", cellphoneNumber: "1234567890" });
        const service = new CheckPhoneNumberDiponibilityService();
        const result = await service.execute("user-id", "1234567890");
        expect(result).toBe(false);
        expect(AppDataSource.getRepository).toHaveBeenCalledWith(User);
        expect(mockFindOneBy).toHaveBeenCalledWith({ cellphoneNumber: "1234567890" });
    });

    it("should return true if the found user's ID does not match the given userId", async () => {
        mockFindOneBy.mockResolvedValue({ id: "another-user-id", cellphoneNumber: "1234567890" });
        const service = new CheckPhoneNumberDiponibilityService();
        const result = await service.execute("user-id", "1234567890");
        expect(result).toBe(true);
        expect(AppDataSource.getRepository).toHaveBeenCalledWith(User);
        expect(mockFindOneBy).toHaveBeenCalledWith({ cellphoneNumber: "1234567890" });
    });

    it("should throw an AppError if an error occurs", async () => {
        const mockError = new Error("Database error");
        mockFindOneBy.mockRejectedValue(mockError);
        const service = new CheckPhoneNumberDiponibilityService();
        await expect(service.execute("user-id", "1234567890")).rejects.toEqual({
            message: "Database error",
            statusCode: 400,
        });
        expect(AppDataSource.getRepository).toHaveBeenCalledWith(User);
        expect(mockFindOneBy).toHaveBeenCalledWith({ cellphoneNumber: "1234567890" });
    });
});
