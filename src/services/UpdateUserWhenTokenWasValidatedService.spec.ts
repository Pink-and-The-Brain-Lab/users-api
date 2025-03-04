import { AppDataSource } from "../data-source";
import UpdateUserWhenTokenWasValidatedService from "./UpdateUserWhenTokenWasValidatedService";

jest.mock("../data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe("UpdateUserWhenTokenWasValidatedService", () => {
  let updateUserService: UpdateUserWhenTokenWasValidatedService;

  beforeEach(() => {
    updateUserService = new UpdateUserWhenTokenWasValidatedService();
  });

  it("should throw an error if the user is not found", async () => {
    const mockUserRepository = {
      findOneBy: jest.fn().mockResolvedValue(null),
    };
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepository);

    await expect(updateUserService.execute("test@example.com")).rejects.toEqual({
        message: "API_ERRORS.USER_NOT_FOUND",
        statusCode: 404,
    });
    expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: "test@example.com" });
  });

  it("should update the user as validated and return the updated user", async () => {
    const mockUser = { id: 1, email: "test@example.com", validated: false };
    const mockUserRepository = {
      findOneBy: jest.fn().mockResolvedValue(mockUser),
      save: jest.fn().mockResolvedValue({ ...mockUser, validated: true }),
    };
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepository);

    const result = await updateUserService.execute("test@example.com");

    expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(mockUserRepository.save).toHaveBeenCalledWith({ ...mockUser, validated: true });
    expect(result).toEqual({ ...mockUser, validated: true });
  });
});
