import { AppDataSource } from "../data-source";
import { hash, compare } from "bcryptjs";
import CreatePasswordService from "../services/CreatePasswordService";

jest.mock("../data-source", () => ({
    AppDataSource: {
        getRepository: jest.fn(),
    },
}));

jest.mock("bcryptjs", () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

describe("CreatePasswordService", () => {
    let createPasswordService: CreatePasswordService;
    const mockUserRepository = {
        findOneBy: jest.fn(),
        save: jest.fn(),
    };

    beforeEach(() => {
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepository);
        createPasswordService = new CreatePasswordService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should throw an error if the user is not found", async () => {
        mockUserRepository.findOneBy.mockResolvedValue(null);
        await expect(
            createPasswordService.execute({ email: "test@example.com", password: "newPassword123" } as any)
        ).rejects.toEqual({
            message: "API_ERRORS.ERROR_TO_SAVE_NEW_PASSWORD",
            statusCode: 401,
        });
        expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: "test@example.com" });
    });

    it("should throw an error if the new password matches the old password", async () => {
        const mockUser = { email: "test@example.com", password: "hashedOldPassword" };
        mockUserRepository.findOneBy.mockResolvedValue(mockUser);
        (compare as jest.Mock).mockResolvedValue(true);
        await expect(
            createPasswordService.execute({ email: "test@example.com", password: "newPassword123" } as any)
        ).rejects.toEqual({
            message: "API_ERRORS.NEW_PASSWORD_AND_OLD_PASSWORD_CAN_NOT_BE_EQUALS",
            statusCode: 401,
        });
        expect(compare).toHaveBeenCalledWith("newPassword123", "hashedOldPassword");
    });

    it("should hash the new password and save the user", async () => {
        const mockUser = { email: "test@example.com", password: "hashedOldPassword" };
        mockUserRepository.findOneBy.mockResolvedValue(mockUser);
        (compare as jest.Mock).mockResolvedValue(false);
        (hash as jest.Mock).mockResolvedValue("hashedNewPassword");
        const result = await createPasswordService.execute({ email: "test@example.com", password: "newPassword123" } as any);
        expect(hash).toHaveBeenCalledWith("newPassword123", 8);
        expect(mockUserRepository.save).toHaveBeenCalledWith({
            ...mockUser,
            password: "hashedNewPassword",
        });
        expect(result).toBe(true);
    });
});
