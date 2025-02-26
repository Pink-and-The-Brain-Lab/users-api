import request from 'supertest';
import express from 'express';
import { RabbitMqMessagesProducerService } from 'millez-lib-api';
import UpdateUserWhenTokenWasValidatedService from '../services/UpdateUserWhenTokenWasValidatedService';
import { RabbitMqQueues } from '../enums/rabbitmq-queues.enum';
import validationTokenRouter from './validation-token';

jest.mock('millez-lib-api', () => ({
    RabbitMqManageConnection: jest.fn(),
    RabbitMqMessagesProducerService: jest.fn().mockImplementation(() => ({
        sendDataToAPI: jest.fn(),
    })),
    AppError: jest.fn().mockImplementation((message, statusCode) => ({ message, statusCode })),
}));

jest.mock('../services/UpdateUserWhenTokenWasValidatedService', () => {
    return jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    }));
});

const app = express();
app.use(express.json());
app.use('/validate-token', validationTokenRouter);

describe('validationTokenRouter', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 200 and validated: true when token validation is successful', async () => {
        const mockSendDataToAPI = jest.fn().mockResolvedValue({ email: 'test@example.com' });
        (RabbitMqMessagesProducerService as jest.Mock).mockImplementation(() => ({
            sendDataToAPI: mockSendDataToAPI,
        }));
        const mockExecute = jest.fn().mockResolvedValue(true);
        (UpdateUserWhenTokenWasValidatedService as jest.Mock).mockImplementation(() => ({
            execute: mockExecute,
        }));
        const response = await request(app)
            .post('/validate-token')
            .send({ token: 'valid-token' });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ validated: true });
        expect(mockSendDataToAPI).toHaveBeenCalledWith(
            'valid-token',
            RabbitMqQueues.VALIDATE_TOKEN,
            RabbitMqQueues.USER_RESPONSE_QUEUE
        );
        expect(mockExecute).toHaveBeenCalledWith('test@example.com');
    });

    it('should return 500 when RabbitMqMessagesProducerService throws an error', async () => {
        const mockSendDataToAPI = jest.fn().mockReturnValue({ statusCode: 500 });
        (RabbitMqMessagesProducerService as jest.Mock).mockImplementation(() => ({
            sendDataToAPI: mockSendDataToAPI,
        }));
        const response = await request(app)
            .post('/validate-token')
            .send({ token: 'invalid-token' });
        expect(response.status).toBe(500);
        expect(mockSendDataToAPI).toHaveBeenCalledWith(
            'invalid-token',
            RabbitMqQueues.VALIDATE_TOKEN,
            RabbitMqQueues.USER_RESPONSE_QUEUE
        );
    });

    it('should return 500 when UpdateUserWhenTokenWasValidatedService throws an error', async () => {
        const mockSendDataToAPI = jest.fn().mockResolvedValue({ email: 'test@example.com' });
        (RabbitMqMessagesProducerService as jest.Mock).mockImplementation(() => ({
            sendDataToAPI: mockSendDataToAPI,
        }));
        const mockExecute = jest.fn().mockRejectedValue(new Error('Update user error'));
        (UpdateUserWhenTokenWasValidatedService as jest.Mock).mockImplementation(() => ({
            execute: mockExecute,
        }));
        const response = await request(app)
            .post('/validate-token')
            .send({ token: 'valid-token' });
        expect(response.status).toBe(500);
        expect(mockSendDataToAPI).toHaveBeenCalledWith(
            'valid-token',
            RabbitMqQueues.VALIDATE_TOKEN,
            RabbitMqQueues.USER_RESPONSE_QUEUE
        );
        expect(mockExecute).toHaveBeenCalledWith('test@example.com');
    });
});
