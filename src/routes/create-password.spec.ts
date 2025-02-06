import request from 'supertest';
import express from 'express';
import CreatePasswordService from '../services/CreatePasswordService';
import { AppError, ValidateEmail, ValidatePassword } from 'millez-lib-api';
import createPasswordRouter from './create-password';

jest.mock('../services/CreatePasswordService');
jest.mock('millez-lib-api', () => ({
    AppError: jest.fn(),
    ValidateEmail: jest.fn().mockImplementation(() => ({
        validate: jest.fn(),
    })),
    ValidatePassword: jest.fn().mockImplementation(() => ({
        validate: jest.fn(),
    })),
}));

const app = express();
app.use(express.json());
app.use('/create-password', createPasswordRouter);

describe('createPasswordRouter', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 200 and success: true when email and password are valid', async () => {
        const mockValidateEmail = jest.fn().mockReturnValue(true);
        const mockValidatePassword = jest.fn().mockReturnValue([]);
        (ValidateEmail as jest.Mock).mockImplementation(() => ({
            validate: mockValidateEmail,
        }));
        (ValidatePassword as jest.Mock).mockImplementation(() => ({
            validate: mockValidatePassword,
        }));
        const mockExecute = jest.fn().mockResolvedValue(undefined);
        (CreatePasswordService as jest.Mock).mockImplementation(() => ({
            execute: mockExecute,
        }));
        const response = await request(app)
            .post('/create-password')
            .send({
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password123',
            });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ success: true });
        expect(mockValidateEmail).toHaveBeenCalledWith('test@example.com');
        expect(mockValidatePassword).toHaveBeenCalledWith('password123', 'password123');
        expect(mockExecute).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password123',
        });
    });

    it('should return 400 when email is invalid', async () => {
        const mockValidateEmail = jest.fn().mockReturnValue(false);
        (ValidateEmail as jest.Mock).mockImplementation(() => ({
            validate: mockValidateEmail,
        }));
        const response = await request(app)
            .post('/create-password')
            .send({
                email: 'invalid-email',
                password: 'password123',
                confirmPassword: 'password123',
            });
        expect(response.status).toBe(500);
        expect(mockValidateEmail).toHaveBeenCalledWith('invalid-email');
        expect(AppError).toHaveBeenCalledWith('API_ERRORS.INVALID_EMAIL');
    });

    it('should return 400 when passwords do not match', async () => {
        const mockValidateEmail = jest.fn().mockReturnValue(true);
        const mockValidatePassword = jest.fn().mockReturnValue(['Passwords do not match']);
        (ValidateEmail as jest.Mock).mockImplementation(() => ({
            validate: mockValidateEmail,
        }));
        (ValidatePassword as jest.Mock).mockImplementation(() => ({
            validate: mockValidatePassword,
        }));
        const response = await request(app)
            .post('/create-password')
            .send({
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password456',
            });

        expect(response.status).toBe(500);
        expect(mockValidateEmail).toHaveBeenCalledWith('test@example.com');
        expect(mockValidatePassword).toHaveBeenCalledWith('password123', 'password456');
        expect(AppError).toHaveBeenCalledWith(['Passwords do not match']);
    });

    it('should call next with an error if CreatePasswordService throws an error', async () => {
        const mockValidateEmail = jest.fn().mockReturnValue(true);
        const mockValidatePassword = jest.fn().mockReturnValue([]);
        (ValidateEmail as jest.Mock).mockImplementation(() => ({
            validate: mockValidateEmail,
        }));
        (ValidatePassword as jest.Mock).mockImplementation(() => ({
            validate: mockValidatePassword,
        }));
        const mockError = new Error('Service error');
        const mockExecute = jest.fn().mockRejectedValue(mockError);
        (CreatePasswordService as jest.Mock).mockImplementation(() => ({
            execute: mockExecute,
        }));
        const response = await request(app)
            .post('/create-password')
            .send({
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password123',
            });

        expect(response.status).toBe(500);
        expect(mockValidateEmail).toHaveBeenCalledWith('test@example.com');
        expect(mockValidatePassword).toHaveBeenCalledWith('password123', 'password123');
        expect(mockExecute).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password123',
        });
    });
});
