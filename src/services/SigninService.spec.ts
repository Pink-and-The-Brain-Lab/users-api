import { AppDataSource } from "../data-source";
import { compare } from "bcryptjs";
import { AppError, RabbitMqMessagesProducerService } from "millez-lib-api";
import { RabbitMqQueues } from "../enums/rabbitmq-queues.enum";
import SigninService from "./SigninService";

jest.mock("../data-source", () => ({
    AppDataSource: {
        getRepository: jest.fn(),
    },
}));

jest.mock("bcryptjs", () => ({
    compare: jest.fn(),
}));

jest.mock("millez-lib-api", () => ({
    AppError: jest.fn(),
    RabbitMqManageConnection: jest.fn(),
    RabbitMqMessagesProducerService: jest.fn().mockImplementation(() => ({
        sendDataToAPI: jest.fn(),
    })),
}));

describe("SigninService", () => {
    let signinService: SigninService;

    beforeEach(() => {
        signinService = new SigninService();
    });

    it("should throw an error if the user is not found", async () => {
        const mockUserRepository = {
            findOneBy: jest.fn().mockResolvedValue(null),
        };
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepository);

        await expect(
            signinService.execute({ email: "test@example.com", password: "password", keepLoggedIn: true })
        ).rejects.toBeInstanceOf(AppError);
    });

    it("should throw an error if the user is not validated", async () => {
        const mockUserRepository = {
            findOneBy: jest.fn().mockResolvedValue({ validated: false }),
        };
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepository);

        await expect(
            signinService.execute({ email: "test@example.com", password: "password", keepLoggedIn: true })
        ).rejects.toBeInstanceOf(AppError);
    });

    it("should throw an error if the password does not match", async () => {
        const mockUserRepository = {
            findOneBy: jest.fn().mockResolvedValue({ validated: true, password: "hashedPassword" }),
        };
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepository);
        (compare as jest.Mock).mockResolvedValue(false);

        await expect(
            signinService.execute({ email: "test@example.com", password: "password", keepLoggedIn: true })
        ).rejects.toBeInstanceOf(AppError);
    });

    it("should return tokenApiResponse if all validations pass", async () => {
        const mockUser = { id: 1, validated: true, password: "hashedPassword" };
        const mockUserRepository = {
            findOneBy: jest.fn().mockResolvedValue(mockUser),
        };
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepository);
        (compare as jest.Mock).mockResolvedValue(true);

        const mockRabbitMqService = {
            sendDataToAPI: jest.fn().mockResolvedValue("mockTokenApiResponse"),
        };
        (RabbitMqMessagesProducerService as jest.Mock).mockImplementation(() => mockRabbitMqService);

        const result = await signinService.execute({
            email: "test@example.com",
            password: "password",
            keepLoggedIn: true,
        });

        expect(result).toBe("mockTokenApiResponse");
        expect(mockRabbitMqService.sendDataToAPI).toHaveBeenCalledWith(
            { userId: mockUser.id, keepLoggedIn: true },
            RabbitMqQueues.CREATE_SESSION,
            RabbitMqQueues.USER_RESPONSE_QUEUE
        );
    });
});