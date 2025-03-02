import { hash } from "bcryptjs";
import { AppDataSource } from "../data-source";
import { RabbitMqMessagesProducerService, ValidateEmail, ValidatePassword, AppError } from "millez-lib-api";
import CreateUserService from "./CreateUserService";
import { RabbitMqQueues } from "../enums/rabbitmq-queues.enum";
import User from "../models/user.model";

jest.mock("bcryptjs");
jest.mock("../data-source");
jest.mock('millez-lib-api', () => ({
    AppError: jest.fn(),
    ValidateEmail: jest.fn().mockImplementation(() => ({
        validate: jest.fn(),
    })),
    ValidatePassword: jest.fn().mockImplementation(() => ({
        validate: jest.fn(),
    })),
    RabbitMqManageConnection: jest.fn(),
    RabbitMqMessagesProducerService: jest.fn().mockImplementation(() => ({
        sendDataToAPI: jest.fn(),
    })),
}));

describe("CreateUserService", () => {
    let mockRabbitMqService: RabbitMqMessagesProducerService;

    beforeEach(() => {
        mockRabbitMqService = new RabbitMqMessagesProducerService({} as any); // Mocked RabbitMQ connection
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should create a new user successfully", async () => {
        const service = new CreateUserService();
        const userData = {
            email: "test@example.com",
            name: "Test User",
            password: "password123",
            confirmPassword: "password123",
            allowZellimCommunicate: true,
            recieveInformation: true,
        };
        const mockUserRepository = {
            findOneBy: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockImplementation((userData) => userData),
            save: jest.fn().mockResolvedValue({ id: "123", ...userData }),
        };
        const mockValidateEmail = jest.fn().mockReturnValue(true);
        const mockValidatePassword = jest.fn().mockReturnValue([]);
        const mockHash = jest.fn().mockResolvedValue("hashedPassword");
        const mockSendDataToAPI = jest.fn()
            .mockResolvedValueOnce({ statusCode: 0 })
            .mockResolvedValueOnce({ statusCode: 0, id: "profileId" });
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepository);
        (ValidateEmail as jest.Mock).mockImplementation(() => ({
            validate: mockValidateEmail,
        }));
        (ValidatePassword as jest.Mock).mockImplementation(() => ({
            validate: mockValidatePassword,
        }));
        (hash as jest.Mock).mockImplementation(mockHash);
        (RabbitMqMessagesProducerService as jest.Mock).mockImplementation(() => ({
            sendDataToAPI: mockSendDataToAPI
        }));
        const result = await service.execute(userData);
        expect(mockValidateEmail).toHaveBeenCalledWith(userData.email);
        expect(mockValidatePassword).toHaveBeenCalledWith(userData.password, userData.confirmPassword);
        expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: userData.email });
        expect(mockHash).toHaveBeenCalledWith(userData.password, 8);
        expect(mockUserRepository.create).toHaveBeenCalledWith({
            email: userData.email,
            name: userData.name,
            password: "hashedPassword",
            allowZellimCommunicate: userData.allowZellimCommunicate,
            recieveInformation: userData.recieveInformation,
            validated: false,
            activeProfileId: '',
            cellphoneNumber: '',
        });
        expect(mockUserRepository.save).toHaveBeenCalled();
        expect(mockSendDataToAPI).toHaveBeenCalledTimes(2);
        expect(result).toEqual(expect.objectContaining({ email: userData.email }));
    });

    it("should throw an error if email is invalid", async () => {
        const service = new CreateUserService();
        const mockValidateEmail = jest.fn().mockReturnValue(false);
        (ValidateEmail as jest.Mock).mockImplementation(() => ({
            validate: mockValidateEmail,
        }));
        const userData = {
            email: "invalid-email",
            name: "Test User",
            password: "password123",
            confirmPassword: "password123",
            allowZellimCommunicate: true,
            recieveInformation: true,
        };
        await expect(service.execute(userData)).rejects.toBeInstanceOf(AppError)
        expect(mockValidateEmail).toHaveBeenCalledWith(userData.email);
    });

    it("should throw an error if email is already registered", async () => {
        const service = new CreateUserService();
        const mockUserRepository = {
            findOneBy: jest.fn().mockResolvedValue({ id: "123", email: "test@example.com" }),
        };
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepository);
        const userData = {
            email: "test@example.com",
            name: "Test User",
            password: "password123",
            confirmPassword: "password123",
            allowZellimCommunicate: true,
            recieveInformation: true,
        };
        await expect(service.execute(userData)).rejects.toBeInstanceOf(AppError);
    });

    it("should throw an error if passwword was diferent", async () => {
        const service = new CreateUserService();
        const mockValidateEmail = jest.fn().mockReturnValue(true);
        const mockValidatePassword = jest.fn().mockReturnValue(['Passwords do not match']);
        (ValidateEmail as jest.Mock).mockImplementation(() => ({
            validate: mockValidateEmail,
        }));
        (ValidatePassword as jest.Mock).mockImplementation(() => ({
            validate: mockValidatePassword,
        }));
        const userData = {
            email: "invalid-email",
            name: "Test User",
            password: "password123",
            confirmPassword: "password456",
            allowZellimCommunicate: true,
            recieveInformation: true,
        };
        await expect(service.execute(userData)).rejects.toBeInstanceOf(AppError);
        expect(mockValidatePassword).toHaveBeenCalledWith('password123', 'password456');
        expect(AppError).toHaveBeenCalledWith(['Passwords do not match']);
    });

    it("should throw an error if email was already registred", async () => {
        const service = new CreateUserService();
        const mockValidateEmail = jest.fn().mockReturnValue(true);
        const mockValidatePassword = jest.fn().mockReturnValue([]);
        (ValidateEmail as jest.Mock).mockImplementation(() => ({
            validate: mockValidateEmail,
        }));
        (ValidatePassword as jest.Mock).mockImplementation(() => ({
            validate: mockValidatePassword,
        }));
        (AppDataSource.getRepository as jest.Mock).mockReturnValue({
            findOneBy: jest.fn().mockResolvedValue(true),
        });
        const userData = {
            email: "invalid-email",
            name: "Test User",
            password: "password123",
            confirmPassword: "password456",
            allowZellimCommunicate: true,
            recieveInformation: true,
        };
        await expect(service.execute(userData)).rejects.toBeInstanceOf(AppError);
    });

    it("should throw an error if the token API response contains a statusCode", async () => {
        const service = new CreateUserService();
        const mockSendDataToAPI = jest.fn().mockResolvedValue({
            statusCode: 500,
            message: "Internal server error",
        });
        (mockRabbitMqService.sendDataToAPI as jest.Mock).mockImplementation(mockSendDataToAPI);
        const email = "test@example.com";
        await expect(
            (service as any).createToken(mockRabbitMqService, email)
        ).rejects.toBeInstanceOf(AppError);
        expect(mockSendDataToAPI).toHaveBeenCalledWith(
            email,
            RabbitMqQueues.CREATE_TOKEN,
            RabbitMqQueues.USER_RESPONSE_QUEUE
        );
    });

    it("should throw an error if the token API response contains a statusCode with default message", async () => {
        const service = new CreateUserService();
        const mockSendDataToAPI = jest.fn().mockResolvedValue({
            statusCode: 500,
        });
        (mockRabbitMqService.sendDataToAPI as jest.Mock).mockImplementation(mockSendDataToAPI);
        const email = "test@example.com";
        await expect(
            (service as any).createToken(mockRabbitMqService, email)
        ).rejects.toBeInstanceOf(AppError);
        expect(mockSendDataToAPI).toHaveBeenCalledWith(
            email,
            RabbitMqQueues.CREATE_TOKEN,
            RabbitMqQueues.USER_RESPONSE_QUEUE
        );
    });

    it("should not throw an error if the token API response does not contain a statusCode", async () => {
        const service = new CreateUserService();
        const mockSendDataToAPI = jest.fn().mockResolvedValue({
            statusCode: 0,
        });
        (mockRabbitMqService.sendDataToAPI as jest.Mock).mockImplementation(mockSendDataToAPI);
        const email = "test@example.com";
        await expect(
            (service as any).createToken(mockRabbitMqService, email)
        ).resolves.not.toThrow();
        expect(mockSendDataToAPI).toHaveBeenCalledWith(
            email,
            RabbitMqQueues.CREATE_TOKEN,
            RabbitMqQueues.USER_RESPONSE_QUEUE
        );
    });

    it("should throw an error if the profile API response contains a statusCode", async () => {
        const service = new CreateUserService();
        const mockSendDataToAPI = jest.fn().mockResolvedValue({
            statusCode: 500,
            message: "Internal server error",
        });
        (mockRabbitMqService.sendDataToAPI as jest.Mock).mockImplementation(mockSendDataToAPI);
        const user: User = {
            id: "123",
            email: "test@example.com",
        } as User;
        await expect(
            (service as any).validateProfile(mockRabbitMqService, user)
        ).rejects.toBeInstanceOf(AppError);
        expect(mockSendDataToAPI).toHaveBeenCalledWith(
            { userId: user.id, email: user.email },
            RabbitMqQueues.CREATE_PROFILE_AFTER_SIGNUP,
            RabbitMqQueues.USER_RESPONSE_QUEUE
        );
    });

    it("should throw an error if the profile API response contains a statusCode with default message", async () => {
        const service = new CreateUserService();
        const mockSendDataToAPI = jest.fn().mockResolvedValue({
            statusCode: 500,
        });
        (mockRabbitMqService.sendDataToAPI as jest.Mock).mockImplementation(mockSendDataToAPI);
        const user: User = {
            id: "123",
            email: "test@example.com",
        } as User;
        await expect(
            (service as any).validateProfile(mockRabbitMqService, user)
        ).rejects.toBeInstanceOf(AppError);
        expect(mockSendDataToAPI).toHaveBeenCalledWith(
            { userId: user.id, email: user.email },
            RabbitMqQueues.CREATE_PROFILE_AFTER_SIGNUP,
            RabbitMqQueues.USER_RESPONSE_QUEUE
        );
    });

    it("should not throw an error if the profile API response does not contain a statusCode", async () => {
        const service = new CreateUserService();
        const mockSendDataToAPI = jest.fn().mockResolvedValue({
            statusCode: 0,
        });
        (mockRabbitMqService.sendDataToAPI as jest.Mock).mockImplementation(mockSendDataToAPI);
        const user: User = {
            id: "123",
            email: "test@example.com",
        } as User;
        await expect(
            (service as any).validateProfile(mockRabbitMqService, user)
        ).resolves.not.toThrow();
        expect(mockSendDataToAPI).toHaveBeenCalledWith(
            { userId: user.id, email: user.email },
            RabbitMqQueues.CREATE_PROFILE_AFTER_SIGNUP,
            RabbitMqQueues.USER_RESPONSE_QUEUE
        );
    });
});