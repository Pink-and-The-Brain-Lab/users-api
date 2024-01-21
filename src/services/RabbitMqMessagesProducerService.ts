import RabbitMqManageConnection from "../utils/RabbitMqManageConnection";
import { RabbitMqQueues } from "../utils/rabbitmq-queues.enum";
import { uuid } from 'uuidv4';

export class RabbitMqMessagesProducerService {
    async sendEmailtoTokenAPI(email: string) {
        const rabbitmq = new RabbitMqManageConnection();
        const channel = await rabbitmq.createChannel(RabbitMqQueues.GENERIC_QUEUE);
        const correlationId = uuid();
        const message = JSON.stringify({ email });
        channel.sendToQueue(
            RabbitMqQueues.CREATE_TOKEN,
            Buffer.from(message),
            {
                correlationId,
                replyTo: RabbitMqQueues.GENERIC_QUEUE
            }
        );

        return this.awaitTokenApiResponse(rabbitmq, channel, correlationId);
    }

    private awaitTokenApiResponse(connection: RabbitMqManageConnection, channel: any, correlationId: string): Promise<any> {
        return new Promise(resolve => {
            channel.consume(RabbitMqQueues.GENERIC_QUEUE, (message: any) => {
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