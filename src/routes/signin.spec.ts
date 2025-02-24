import request from 'supertest';
import express from 'express';
import SigninService from '../services/SigninService';
import signinRouter from './signin';

jest.mock('../services/SigninService', () => {
    return jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    }));
});

const app = express();
app.use(express.json());
app.use('/signin', signinRouter);

describe('signinRouter', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 200 and login data when signin is successful', async () => {
        const mockExecute = jest.fn().mockResolvedValue({
            token: 'mockToken',
            user: { id: 1, email: 'test@example.com' },
        });
        (SigninService as jest.Mock).mockImplementation(() => ({
            execute: mockExecute,
        }));
        const response = await request(app)
            .post('/signin')
            .send({ email: 'test@example.com', password: 'password123', keepLoggedIn: true });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            token: 'mockToken',
            user: { id: 1, email: 'test@example.com' },
        });
        expect(mockExecute).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password123',
            keepLoggedIn: true,
        });
    });

    it('should return 500 when SigninService throws an error', async () => {
        const mockExecute = jest.fn().mockRejectedValue(new Error('Invalid credentials'));
        (SigninService as jest.Mock).mockImplementation(() => ({
            execute: mockExecute,
        }));
        const response = await request(app)
            .post('/signin')
            .send({ email: 'test@example.com', password: 'wrongpassword', keepLoggedIn: false });
        expect(response.status).toBe(500);
        expect(mockExecute).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'wrongpassword',
            keepLoggedIn: false,
        });
    });
});
