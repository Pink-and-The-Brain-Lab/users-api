import request from 'supertest';
import express from 'express';
import CreateUserService from '../services/CreateUserService';
import signupRouter from './signup';

jest.mock('../services/CreateUserService', () => {
  return jest.fn().mockImplementation(() => ({
    execute: jest.fn(),
  }));
});

const app = express();
app.use(express.json());
app.use('/signup', signupRouter);

describe('signupRouter', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and user data when signup is successful', async () => {
    const mockExecute = jest.fn().mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      allowZellimCommunicate: true,
      recieveInformation: false,
    });
    (CreateUserService as jest.Mock).mockImplementation(() => ({
      execute: mockExecute,
    }));
    const response = await request(app)
      .post('/signup')
      .send({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        confirmPassword: 'password123',
        allowZellimCommunicate: true,
        recieveInformation: false,
      });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      allowZellimCommunicate: true,
      recieveInformation: false,
    });
    expect(mockExecute).toHaveBeenCalledWith({
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
      confirmPassword: 'password123',
      allowZellimCommunicate: true,
      recieveInformation: false,
    });
  });

  it('should return 500 when CreateUserService throws an error', async () => {
    const mockExecute = jest.fn().mockRejectedValue(new Error('Invalid data'));
    (CreateUserService as jest.Mock).mockImplementation(() => ({
      execute: mockExecute,
    }));
    const response = await request(app)
      .post('/signup')
      .send({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        confirmPassword: 'password123',
        allowZellimCommunicate: true,
        recieveInformation: false,
      });
    expect(response.status).toBe(500);
    expect(mockExecute).toHaveBeenCalledWith({
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
      confirmPassword: 'password123',
      allowZellimCommunicate: true,
      recieveInformation: false,
    });
  });
});
