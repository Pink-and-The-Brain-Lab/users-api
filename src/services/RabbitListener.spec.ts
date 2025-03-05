import RabbitListener from './RabbitListener';
import { RabbitMqManageConnection, RabbitMqListener } from 'millez-lib-api';
import { RabbitMqQueues } from '../enums/rabbitmq-queues.enum';
import UpdateUserWithActiveProfileIdService from './UpdateUserWithActiveProfileIdService';
import CheckPhoneNumberDiponibilityService from './CheckPhoneNumberDiponibilityService';
import CheckEmailDiponibilityService from './CheckEmailDiponibilityService';
import UpdateUserWithPhoneNumberService from './UpdateUserWithPhoneNumberService';
import { RABBITMQ_HOST_URL } from '../constants/rabbitmq-host-url';
import { IUpdateUserWithActiveProfileId } from './interfaces/update-user-with-active-profile-id';
import { ICheckPhoneNumberDisponibility } from './interfaces/check-phone-number-disponibility.interface';
import { ICheckEmailDisponibility } from './interfaces/check-email-disponibility.interface';

jest.mock('millez-lib-api');
jest.mock('./UpdateUserWithActiveProfileIdService');
jest.mock('./CheckPhoneNumberDiponibilityService');
jest.mock('./CheckEmailDiponibilityService');
jest.mock('./UpdateUserWithPhoneNumberService');

describe('RabbitListener', () => {
    let rabbitListener: RabbitListener;

    beforeEach(() => {
        rabbitListener = new RabbitListener();
        jest.clearAllMocks();
    });

    it('should set up listeners correctly', async () => {
        const mockConnection = jest.fn();
        const mockRabbitListener = {
            genericListener: jest.fn(),
        };
        (RabbitMqManageConnection as jest.Mock).mockImplementation(() => mockConnection);
        (RabbitMqListener as jest.Mock).mockImplementation(() => mockRabbitListener);
        await rabbitListener.listeners();
        expect(RabbitMqManageConnection).toHaveBeenCalledWith(RABBITMQ_HOST_URL);
        expect(RabbitMqListener).toHaveBeenCalledWith(mockConnection);
        expect(mockRabbitListener.genericListener).toHaveBeenCalledWith(
            RabbitMqQueues.UPDATE_USER_WITH_SELECTED_PROFILE_ID,
            expect.any(Function)
        );
        expect(mockRabbitListener.genericListener).toHaveBeenCalledWith(
            RabbitMqQueues.CHECK_PHONE_NUMBER_DISPONIBILITY,
            expect.any(Function)
        );
        expect(mockRabbitListener.genericListener).toHaveBeenCalledWith(
            RabbitMqQueues.CHECK_EMAIL_DISPONIBILITY,
            expect.any(Function)
        );
        expect(mockRabbitListener.genericListener).toHaveBeenCalledWith(
            RabbitMqQueues.UPDATE_USER_WITH_PHONE_NUMBER,
            expect.any(Function)
        );
    });

    it('should handle updateUserWithActiveProfileId correctly', async () => {
        const mockExecute = jest.fn().mockResolvedValue({ token: 'valid-token' });
        (UpdateUserWithActiveProfileIdService.prototype.execute as jest.Mock).mockImplementation(mockExecute);
        const result = await (rabbitListener as any).updateUserWithActiveProfileId({ userId: '123', profileId: '456' });
        expect(mockExecute).toHaveBeenCalledWith('123', '456');
        expect(result).toEqual({ token: 'valid-token' });
    });

    it('should handle checkPhoneNumberDisponibility correctly', async () => {
        const mockExecute = jest.fn().mockResolvedValue(true);
        (CheckPhoneNumberDiponibilityService.prototype.execute as jest.Mock).mockImplementation(mockExecute);
        const result = await (rabbitListener as any).checkPhoneNumberDisponibility({ userId: '123', phoneNumber: '1234567890' });
        expect(mockExecute).toHaveBeenCalledWith('123', '1234567890');
        expect(result).toBe(true);
    });

    it('should handle checkEmailDisponibility correctly', async () => {
        const mockExecute = jest.fn().mockResolvedValue(true);
        (CheckEmailDiponibilityService.prototype.execute as jest.Mock).mockImplementation(mockExecute);
        const result = await (rabbitListener as any).checkEmailDisponibility({ userId: '123', email: 'test@example.com' });
        expect(mockExecute).toHaveBeenCalledWith('123', 'test@example.com');
        expect(result).toBe(true);
    });

    it('should handle updateUserWithPhoneNumber correctly', async () => {
        const mockExecute = jest.fn().mockResolvedValue({ token: 'valid-token' });
        (UpdateUserWithPhoneNumberService.prototype.execute as jest.Mock).mockImplementation(mockExecute);
        const result = await (rabbitListener as any).updateUserWithPhoneNumber({ userId: '123', phoneNumber: '1234567890' });
        expect(mockExecute).toHaveBeenCalledWith('123', '1234567890');
        expect(result).toEqual({ token: 'valid-token' });
    });

    it('should return the error when UpdateUserWithActiveProfileIdService throws an error', async () => {
        const mockError = new Error('Service execution failed');
        (UpdateUserWithActiveProfileIdService.prototype.execute as jest.Mock).mockRejectedValue(mockError);
        const input: IUpdateUserWithActiveProfileId = {
            userId: '123',
            profileId: '456',
        };
        const result = await (rabbitListener as any).updateUserWithActiveProfileId(input);
        expect(UpdateUserWithActiveProfileIdService.prototype.execute).toHaveBeenCalledWith('123', '456');
        expect(result).toBe(mockError);
    });

    it('should return the error when CheckPhoneNumberDiponibilityService throws an error', async () => {
        const mockError = new Error('Service execution failed');
        (CheckPhoneNumberDiponibilityService.prototype.execute as jest.Mock).mockRejectedValue(mockError);
        const input: ICheckPhoneNumberDisponibility = {
            userId: '123',
            phoneNumber: '555-1234',
        };
        const result = await (rabbitListener as any).checkPhoneNumberDisponibility(input);
        expect(CheckPhoneNumberDiponibilityService.prototype.execute).toHaveBeenCalledWith('123', '555-1234');
        expect(result).toBe(mockError);
    });

    it('should return the error when CheckEmailDiponibilityService throws an error', async () => {
        const mockError = new Error('Service execution failed');
        (CheckEmailDiponibilityService.prototype.execute as jest.Mock).mockRejectedValue(mockError);
        const input: ICheckEmailDisponibility = {
            userId: '123',
            email: 'email@mail.com',
        };
        const result = await (rabbitListener as any).checkEmailDisponibility(input);
        expect(CheckEmailDiponibilityService.prototype.execute).toHaveBeenCalledWith('123', 'email@mail.com');
        expect(result).toBe(mockError);
    });

    it('should return the error when UpdateUserWithPhoneNumberService throws an error', async () => {
        const mockError = new Error('Service execution failed');
        (UpdateUserWithPhoneNumberService.prototype.execute as jest.Mock).mockRejectedValue(mockError);
        const input: ICheckPhoneNumberDisponibility = {
            userId: '123',
            phoneNumber: '123 456',
        };
        const result = await (rabbitListener as any).updateUserWithPhoneNumber(input);
        expect(UpdateUserWithPhoneNumberService.prototype.execute).toHaveBeenCalledWith('123', '123 456');
        expect(result).toBe(mockError);
    });
});
