import request from 'supertest';
import express from 'express';
import { AppError, RabbitMqManageConnection, RabbitMqMessagesProducerService, ValidateEmail } from 'millez-lib-api';
import { RabbitMqQueues } from '../enums/rabbitmq-queues.enum';
import generateNewTokenRouter from './generate-new-token';

jest.mock('millez-lib-api', () => ({
    AppError: jest.fn(),
    ValidateEmail: jest.fn().mockImplementation(() => ({
        validate: jest.fn(),
    })),
    RabbitMqManageConnection: jest.fn(),
    RabbitMqMessagesProducerService: jest.fn().mockImplementation(() => ({
        sendDataToAPI: jest.fn(),
    })),
}));

const app = express();
app.use(express.json());
app.use('/generate-token', generateNewTokenRouter);

describe('generateNewTokenRouter', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 200 and created: true when email is valid and token is created', async () => {
        const mockValidate = jest.fn().mockReturnValue(true);
        (ValidateEmail as jest.Mock).mockImplementation(() => ({
            validate: mockValidate,
        }));
        const mockSendDataToAPI = jest.fn().mockResolvedValue({ statusCode: 0 });
        (RabbitMqMessagesProducerService as jest.Mock).mockImplementation(() => ({
            sendDataToAPI: mockSendDataToAPI,
        }));
        const response = await request(app)
            .post('/generate-token')
            .send({ email: 'test@example.com' });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ created: true });
        expect(mockValidate).toHaveBeenCalledWith('test@example.com');
        expect(mockSendDataToAPI).toHaveBeenCalledWith(
            'test@example.com',
            RabbitMqQueues.CREATE_TOKEN,
            RabbitMqQueues.USER_RESPONSE_QUEUE
        );
    });

    it('should return 400 when email is invalid', async () => {
        const mockValidate = jest.fn().mockReturnValue(false);
        (ValidateEmail as jest.Mock).mockImplementation(() => ({
            validate: mockValidate,
        }));
        const response = await request(app)
            .post('/generate-token')
            .send({ email: 'invalid-email' });
        expect(response.status).toBe(500);
        expect(mockValidate).toHaveBeenCalledWith('invalid-email');
        expect(AppError).toHaveBeenCalledWith('API_ERRORS.INVALID_EMAIL');
    });

    it('should return 500 when RabbitMqMessagesProducerService throws an error', async () => {
        const mockValidate = jest.fn().mockReturnValue(true);
        (ValidateEmail as jest.Mock).mockImplementation(() => ({
            validate: mockValidate,
        }));
        const mockSendDataToAPI = jest.fn().mockResolvedValue({
            statusCode: 500,
            message: 'Internal Server Error',
        });
        (RabbitMqMessagesProducerService as jest.Mock).mockImplementation(() => ({
            sendDataToAPI: mockSendDataToAPI,
        }));
        const response = await request(app)
            .post('/generate-token')
            .send({ email: 'test@example.com' });
        expect(response.status).toBe(500);
        expect(mockValidate).toHaveBeenCalledWith('test@example.com');
        expect(mockSendDataToAPI).toHaveBeenCalledWith(
            'test@example.com',
            RabbitMqQueues.CREATE_TOKEN,
            RabbitMqQueues.USER_RESPONSE_QUEUE
        );
        expect(AppError).toHaveBeenCalledWith('Internal Server Error', 500);
    });

    it('should return 500 when RabbitMqMessagesProducerService throws an error and return default message error', async () => {
        const mockValidate = jest.fn().mockReturnValue(true);
        (ValidateEmail as jest.Mock).mockImplementation(() => ({
            validate: mockValidate,
        }));
        const mockSendDataToAPI = jest.fn().mockResolvedValue({
            statusCode: 500,
            message: undefined,
        });
        (RabbitMqMessagesProducerService as jest.Mock).mockImplementation(() => ({
            sendDataToAPI: mockSendDataToAPI,
        }));
        const response = await request(app)
            .post('/generate-token')
            .send({ email: 'test@example.com' });
        expect(response.status).toBe(500);
        expect(mockValidate).toHaveBeenCalledWith('test@example.com');
        expect(mockSendDataToAPI).toHaveBeenCalledWith(
            'test@example.com',
            RabbitMqQueues.CREATE_TOKEN,
            RabbitMqQueues.USER_RESPONSE_QUEUE
        );
        expect(AppError).toHaveBeenCalledWith('Internal server error.', 500);
    });

    it('should call next with an error if RabbitMqManageConnection fails', async () => {
        const mockValidate = jest.fn().mockReturnValue(true);
        (ValidateEmail as jest.Mock).mockImplementation(() => ({
            validate: mockValidate,
        }));
        const mockError = new Error('Connection error');
        (RabbitMqManageConnection as jest.Mock).mockImplementation(() => {
            throw mockError;
        });
        const response = await request(app)
            .post('/generate-token')
            .send({ email: 'test@example.com' });
        expect(response.status).toBe(500);
        expect(mockValidate).toHaveBeenCalledWith('test@example.com');
    });
});
