import { AppDataSource } from "../data-source";
import User from "../models/user.model";
import CheckEmailDiponibilityService from "../services/CheckEmailDiponibilityService";

jest.mock("../data-source", () => ({
    AppDataSource: {
        getRepository: jest.fn(),
    },
}));

describe("CheckEmailDiponibilityService", () => {
    const mockFindOneBy = jest.fn();
    const mockUserRepository = {
        findOneBy: mockFindOneBy,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepository);
    });

    it("should return true if no user is found with the given email", async () => {
        mockFindOneBy.mockResolvedValue(null);
        const service = new CheckEmailDiponibilityService();
        const result = await service.execute("user-id", "test@example.com");
        expect(result).toBe(true);
        expect(AppDataSource.getRepository).toHaveBeenCalledWith(User);
        expect(mockFindOneBy).toHaveBeenCalledWith({ email: "test@example.com" });
    });

    it("should return true if the found user's ID matches the given userId", async () => {
        mockFindOneBy.mockResolvedValue({ id: "user-id", email: "test@example.com" });
        const service = new CheckEmailDiponibilityService();
        const result = await service.execute("user-id", "test@example.com");
        expect(result).toBe(true);
        expect(AppDataSource.getRepository).toHaveBeenCalledWith(User);
        expect(mockFindOneBy).toHaveBeenCalledWith({ email: "test@example.com" });
    });

    it("should return false if the found user's ID does not match the given userId", async () => {
        mockFindOneBy.mockResolvedValue({ id: "another-user-id", email: "test@example.com" });
        const service = new CheckEmailDiponibilityService();
        const result = await service.execute("user-id", "test@example.com");
        expect(result).toBe(false);
        expect(AppDataSource.getRepository).toHaveBeenCalledWith(User);
        expect(mockFindOneBy).toHaveBeenCalledWith({ email: "test@example.com" });
    });

    it("should throw an AppError if an error occurs", async () => {
        const mockError = new Error("Database error");
        mockFindOneBy.mockRejectedValue(mockError);
        const service = new CheckEmailDiponibilityService();
        await expect(service.execute("user-id", "test@example.com")).rejects.toEqual({
            message: "Database error",
            statusCode: 400
        });
        expect(AppDataSource.getRepository).toHaveBeenCalledWith(User);
        expect(mockFindOneBy).toHaveBeenCalledWith({ email: "test@example.com" });
    });
});
