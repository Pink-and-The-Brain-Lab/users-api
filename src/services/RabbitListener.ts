import { RabbitMqListener, RabbitMqManageConnection } from 'millez-lib-api';
import { RabbitMqQueues } from '../enums/rabbitmq-queues.enum';
import { IValidationTokenData } from './interfaces/validation-token-data.interface';
import CheckPhoneNumberDiponibilityService from './CheckPhoneNumberDiponibilityService';
import UpdateUserWithActiveProfileIdService from './UpdateUserWithActiveProfileIdService';
import CheckEmailDiponibilityService from './CheckEmailDiponibilityService';
import { IUpdateUserWithActiveProfileId } from './interfaces/update-user-with-active-profile-id';
import { ICheckPhoneNumberDisponibility } from './interfaces/check-phone-number-disponibility.interface';
import { ICheckEmailDisponibility } from './interfaces/check-email-disponibility.interface';
import UpdateUserWithPhoneNumberService from './UpdateUserWithPhoneNumberService';

class RabbitListener {
    async listeners(): Promise<void> {
        const connection = new RabbitMqManageConnection('amqp://localhost');
        const rabbitListener = new RabbitMqListener(connection);
        rabbitListener.genericListener<IValidationTokenData, IUpdateUserWithActiveProfileId>(RabbitMqQueues.UPDATE_USER_WITH_SELECTED_PROFILE_ID, this.updateUserWithActiveProfileId);
        rabbitListener.genericListener<boolean, ICheckPhoneNumberDisponibility>(RabbitMqQueues.CHECK_PHONE_NUMBER_DISPONIBILITY, this.checkPhoneNumberDisponibility);
        rabbitListener.genericListener<boolean, ICheckEmailDisponibility>(RabbitMqQueues.CHECK_EMAIL_DISPONIBILITY, this.checkEmailDisponibility);
        rabbitListener.genericListener<IValidationTokenData, ICheckPhoneNumberDisponibility>(RabbitMqQueues.UPDATE_USER_WITH_PHONE_NUMBER, this.updateUserWithPhoneNumber);
    }

    private async updateUserWithActiveProfileId({ userId, profileId }: IUpdateUserWithActiveProfileId): Promise<IValidationTokenData> {
        try {
            return await new UpdateUserWithActiveProfileIdService().execute(userId, profileId);
        } catch (error) {
            return error as any;
        }
    }

    private async checkPhoneNumberDisponibility({ userId, phoneNumber }: ICheckPhoneNumberDisponibility): Promise<boolean> {
        try {
            return await new CheckPhoneNumberDiponibilityService().execute(userId, phoneNumber);
        } catch (error) {
            return error as any;
        }
    }

    private async checkEmailDisponibility({ userId, email }: ICheckEmailDisponibility): Promise<boolean> {
        try {
            return await new CheckEmailDiponibilityService().execute(userId, email);
        } catch (error) {
            return error as any;
        }
    }

    private async updateUserWithPhoneNumber({ userId, phoneNumber }: ICheckPhoneNumberDisponibility): Promise<IValidationTokenData> {
        try {
            return await new UpdateUserWithPhoneNumberService().execute(userId, phoneNumber);
        } catch (error) {
            return error as any;
        }
    }
  
};

export default RabbitListener;
