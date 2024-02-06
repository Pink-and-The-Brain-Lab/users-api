import { RabbitMqManageConnection } from 'millez-lib-api';
import { RabbitMqQueues } from '../enums/rabbitmq-queues.enum';
import { Channel, ConsumeMessage } from 'amqplib';
import { IValidationTokenData } from './interfaces/validation-token-data.interface';
import { responseRabbitQueue } from './interfaces/response-rabbit-queue.type';
import CheckPhoneNumberDiponibilityService from './CheckPhoneNumberDiponibilityService';
import { IUpdateUserWithPhoneNumberAndActiveProfileId } from './interfaces/update-user-with-phone-number-and-active-profile-id';
import UpdateUserWithPhoneNumberActiveProfileIdService from './UpdateUserWithPhoneNumberActiveProfileIdService';
import CheckEmailDiponibilityService from './CheckEmailDiponibilityService';

class RabbitMqListener {
    private rabbitmq: RabbitMqManageConnection;

    async listeners(): Promise<void> {
        this.rabbitmq = new RabbitMqManageConnection('amqp://localhost');
        this.genericListener<IValidationTokenData>(RabbitMqQueues.UPDATE_USER_WITH_PROFILE_DATA, this.updateUserWithActiveProfileId);
        this.genericListener<boolean>(RabbitMqQueues.CHECK_PHONE_NUMBER_DISPONIBILITY, this.checkPhoneNumberDisponibility);
        this.genericListener<boolean>(RabbitMqQueues.CHECK_EMAIL_DISPONIBILITY, this.checkEmailDisponibility);
    }

    private async genericListener<T>(queue: RabbitMqQueues, callback: Function): Promise<void> {
        const channel = await this.rabbitmq.createChannel(queue);
        channel.consume(queue, async (message: ConsumeMessage | null) => {
            if (!message) return;
            const content: IUpdateUserWithPhoneNumberAndActiveProfileId = JSON.parse(message.content.toString()).data;
            let response: T = await callback(content);
            this.rabbitQueueResponse<T>(channel, message, response);
            channel.ack(message);
        });
    }

    private rabbitQueueResponse<T>(channel: Channel, message: ConsumeMessage, response: T): void {
        const correlationId = message.properties.correlationId;
        const replyTo = message.properties.replyTo;
        channel.sendToQueue(
            replyTo,
            Buffer.from(JSON.stringify(response)),
            { correlationId }
        );
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

export default RabbitMqListener;
