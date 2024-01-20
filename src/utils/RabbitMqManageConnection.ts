import amqplib from 'amqplib';
import { RabbitMqQueues } from './rabbitmq-queues.enum';

class RabbitMqManageConnection {
    private CONNECTION: any;

    async createChannel(queueName: RabbitMqQueues) {
        this.CONNECTION = await amqplib.connect('amqp://localhost');
        const channel = await this.CONNECTION.createChannel();
        await channel.assertQueue(queueName);
        return channel;
    }
    
    async closeConnection() {
        this.CONNECTION.close();
    }    
}

export default RabbitMqManageConnection;
