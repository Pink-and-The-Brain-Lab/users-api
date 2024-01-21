import RabbitMqManageConnection from "../utils/RabbitMqManageConnection";
import { RabbitMqQueues } from "../utils/rabbitmq-queues.enum";
import { uuid } from 'uuidv4';

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

    private awaitTokenApiResponse(connection: RabbitMqManageConnection, channel: any, correlationId: string): Promise<any> {
        return new Promise(resolve => {
            channel.consume(RabbitMqQueues.RESPONSE_QUEUE, (message: any) => {
                if (message?.properties.correlationId === correlationId) {
                    const response = JSON.parse(message.content.toString());
                    resolve(response);
                    connection.closeConnection();
                };
            }, {
                noAck: true,
            });
        });
    }
}