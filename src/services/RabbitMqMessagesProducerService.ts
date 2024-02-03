import { Channel, ConsumeMessage } from "amqplib";
import { RabbitMqQueues } from "../enums/rabbitmq-queues.enum";
import { uuid } from 'uuidv4';
import { IValidationTokenData } from "./interfaces/validation-token-data.interface";
import  { RabbitMqManageConnection } from "millez-lib-api";

export class RabbitMqMessagesProducerService {
    async sendDataToAPI<T>(data: T, queue: RabbitMqQueues) {
        const rabbitmq = new RabbitMqManageConnection('amqp://localhost');
        const channel = await rabbitmq.createChannel(RabbitMqQueues.RESPONSE_QUEUE);
        const correlationId = uuid();
        const message = JSON.stringify({ data });
        channel.sendToQueue(
            queue,
            Buffer.from(message),
            {
                correlationId,
                replyTo: RabbitMqQueues.RESPONSE_QUEUE
            }
        );

        return this.awaitApiResponse(rabbitmq, channel, correlationId);
    }

    private awaitApiResponse(
        connection: RabbitMqManageConnection,
        channel: Channel,
        correlationId: string
    ): Promise<IValidationTokenData> {
        return new Promise(resolve => {
            channel.consume(RabbitMqQueues.RESPONSE_QUEUE, (message: ConsumeMessage | null) => {
                if (message?.properties.correlationId === correlationId) {
                    const response: IValidationTokenData = JSON.parse(message.content.toString());
                    
                    resolve(response);
                    connection.closeConnection();
                };
            }, {
                noAck: true,
            });
        });
    }
}