import RabbitMqManageConnection from "../utils/RabbitMqManageConnection";
import { RabbitMqQueues } from "../utils/rabbitmq-queues.enum";

export class RabbitMqMessagesProducerService {
    async sendEmailtoTokenAPI(email: string) {
        const rabbitmq = new RabbitMqManageConnection();
        const channel = await rabbitmq.createChannel(RabbitMqQueues.CREATE_TOKEN);
        const message = JSON.stringify({ email });
        channel.sendToQueue(RabbitMqQueues.CREATE_TOKEN, Buffer.from(message));
    }
}