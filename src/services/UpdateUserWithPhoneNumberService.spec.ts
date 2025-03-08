import { AppDataSource } from "../data-source";
import UpdateUserWithPhoneNumberService from "./UpdateUserWithPhoneNumberService";

jest.mock("../data-source", () => ({
    AppDataSource: {
        getRepository: jest.fn(),
    },
}));

describe("UpdateUserWithPhoneNumberService", () => {
    let updateUserService: UpdateUserWithPhoneNumberService;

    beforeEach(() => {
        updateUserService = new UpdateUserWithPhoneNumberService();
    });

    it("should throw an error if the user is not found", async () => {
        const mockUserRepository = {
            findOneBy: jest.fn().mockResolvedValue(null),
        };
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepository);

        await expect(updateUserService.execute("user-id", "1234567890")).rejects.toEqual({
            message: "API_ERRORS.USER_NOT_FOUND",
            statusCode: 404
        });
        expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: "user-id" });
    });

    it("should update the user's phone number and return the updated phone number", async () => {
        const mockUser = { id: "user-id", cellphoneNumber: null };
        const mockUserRepository = {
            findOneBy: jest.fn().mockResolvedValue(mockUser),
            save: jest.fn().mockResolvedValue({ ...mockUser, cellphoneNumber: "1234567890" }),
        };
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepository);

        const result = await updateUserService.execute("user-id", "1234567890");

        expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: "user-id" });
        expect(mockUserRepository.save).toHaveBeenCalledWith({ ...mockUser, cellphoneNumber: "1234567890" });
        expect(result).toEqual({ cellphoneNumber: "1234567890" });
    });

    it("should throw an AppError if an unexpected error occurs", async () => {
        const mockUserRepository = {
            findOneBy: jest.fn().mockRejectedValue(new Error("Unexpected error")),
        };
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepository);

        await expect(updateUserService.execute("user-id", "1234567890")).rejects.toBeInstanceOf(Error);
    });
});
