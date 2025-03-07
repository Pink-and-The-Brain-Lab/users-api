import { AppDataSource } from "../data-source";
import UpdateUserWithActiveProfileIdService from "./UpdateUserWithActiveProfileIdService";

jest.mock("../data-source", () => ({
    AppDataSource: {
        getRepository: jest.fn(),
    },
}));

describe("UpdateUserWithActiveProfileIdService", () => {
    let updateUserService: UpdateUserWithActiveProfileIdService;

    beforeEach(() => {
        updateUserService = new UpdateUserWithActiveProfileIdService();
    });

    it("should throw an error if the user is not found", async () => {
        const mockUserRepository = {
            findOneBy: jest.fn().mockResolvedValue(null),
        };
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepository);

        await expect(
            updateUserService.execute("user-id", "profile-id")
        ).rejects.toEqual({
            message: "API_ERRORS.USER_NOT_FOUND",
            statusCode: 400
        });

        expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: "user-id" });
    });

    it("should update the user's activeProfileId and return the updated user", async () => {
        const mockUser = { id: "user-id", activeProfileId: null };
        const mockUserRepository = {
            findOneBy: jest.fn().mockResolvedValue(mockUser),
            save: jest.fn().mockResolvedValue({ ...mockUser, activeProfileId: "profile-id" }),
        };
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepository);

        const result = await updateUserService.execute("user-id", "profile-id");

        expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: "user-id" });
        expect(mockUserRepository.save).toHaveBeenCalledWith({ ...mockUser, activeProfileId: "profile-id" });
        expect(result).toEqual({ ...mockUser, activeProfileId: "profile-id" });
    });

    it("should throw an AppError if an unexpected error occurs", async () => {
        const mockUserRepository = {
            findOneBy: jest.fn().mockRejectedValue(new Error("Unexpected error")),
        };
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepository);

        await expect(
            updateUserService.execute("user-id", "profile-id")
        ).rejects.toEqual({
            message: "Unexpected error",
            statusCode: 400
        });
    });
});
