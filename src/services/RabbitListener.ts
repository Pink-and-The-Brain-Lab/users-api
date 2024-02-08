import { RabbitMqListener, RabbitMqManageConnection } from 'millez-lib-api';
import { RabbitMqQueues } from '../enums/rabbitmq-queues.enum';
import { IValidationTokenData } from './interfaces/validation-token-data.interface';
import CheckPhoneNumberDiponibilityService from './CheckPhoneNumberDiponibilityService';
import { IUpdateUserWithPhoneNumberAndActiveProfileId } from './interfaces/update-user-with-phone-number-and-active-profile-id';
import UpdateUserWithPhoneNumberActiveProfileIdService from './UpdateUserWithPhoneNumberActiveProfileIdService';
import CheckEmailDiponibilityService from './CheckEmailDiponibilityService';

class RabbitListener {
    async listeners(): Promise<void> {
        const connection = new RabbitMqManageConnection('amqp://localhost');
        const rabbitListener = new RabbitMqListener(connection);
        rabbitListener.genericListener<IValidationTokenData, IUpdateUserWithPhoneNumberAndActiveProfileId>(RabbitMqQueues.UPDATE_USER_WITH_PROFILE_DATA, this.updateUserWithActiveProfileId);
        rabbitListener.genericListener<boolean, IUpdateUserWithPhoneNumberAndActiveProfileId>(RabbitMqQueues.CHECK_PHONE_NUMBER_DISPONIBILITY, this.checkPhoneNumberDisponibility);
        rabbitListener.genericListener<boolean, IUpdateUserWithPhoneNumberAndActiveProfileId>(RabbitMqQueues.CHECK_EMAIL_DISPONIBILITY, this.checkEmailDisponibility);
    }

    private async updateUserWithActiveProfileId({ userId, profileId, phoneNumber }: IUpdateUserWithPhoneNumberAndActiveProfileId): Promise<IValidationTokenData> {
        return await new UpdateUserWithPhoneNumberActiveProfileIdService().execute(userId, profileId, phoneNumber);
    }

    private async checkPhoneNumberDisponibility({ userId, phoneNumber }: IUpdateUserWithPhoneNumberAndActiveProfileId): Promise<boolean> {
        return await new CheckPhoneNumberDiponibilityService().execute(userId, phoneNumber);
    }

    private async checkEmailDisponibility({ userId, email }: IUpdateUserWithPhoneNumberAndActiveProfileId): Promise<boolean> {
        return await new CheckEmailDiponibilityService().execute(userId, email);
    }
  
};

export default RabbitListener;
