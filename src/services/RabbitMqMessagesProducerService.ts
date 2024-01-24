import { Channel, ConsumeMessage } from "amqplib";
import RabbitMqManageConnection from "../utils/RabbitMqManageConnection";
import { RabbitMqQueues } from "../utils/rabbitmq-queues.enum";
import { uuid } from 'uuidv4';
import { IErrorMessage } from "../errors/error-message.interface";
import { IValidationTokenData } from "./interfaces/validation-token-data.interface";

export class RabbitMqMessagesProducerService {
    async sendDatatoTokenAPI<T>(data: T, queue: RabbitMqQueues) {
        const rabbitmq = new RabbitMqManageConnection();
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

        return this.awaitTokenApiResponse(rabbitmq, channel, correlationId);
    }

    private awaitTokenApiResponse(
        connection: RabbitMqManageConnection,
        channel: Channel,
        correlationId: string
    ): Promise<IValidationTokenData | IErrorMessage> {
        return new Promise(resolve => {
            channel.consume(RabbitMqQueues.RESPONSE_QUEUE, (message: ConsumeMessage | null) => {
                if (message?.properties.correlationId === correlationId) {
                    const response: IValidationTokenData | IErrorMessage = JSON.parse(message.content.toString());
                    
                    resolve(response);
                    connection.closeConnection();
                };
            }, {
                noAck: true,
            });
        });
    }
}