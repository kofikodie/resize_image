import {
    SQSClient,
    SendMessageCommand,
    CreateQueueCommand,
} from "@aws-sdk/client-sqs";
import * as dotenv from "dotenv";
import { SqsAdapterInterface } from "./SqsAdapterInterface";

dotenv.config();

interface Message {
    Body: string;
}

export default class SQSAdapter implements SqsAdapterInterface {
    private readonly sqs: SQSClient;

    constructor() {
        if (process.env.RUNNING_ENV) {
            this.sqs = new SQSClient({
                region: process.env.AWS_DEFAULT_REGION,
            });
        } else {
            this.sqs = new SQSClient({
                endpoint: process.env.AWS_SERVICES_ENDPOINT ?? "",
                region: process.env.AWS_DEFAULT_REGION,
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
                },
            });
        }
    }

    async createQueue(
        name: string
    ): Promise<{ success: string } | { error: string }> {
        const params = {
            QueueName: name,
        };

        try {
            const command = new CreateQueueCommand(params);
            const response = await this.sqs.send(command);

            return {
                success: response.QueueUrl!,
            };
        } catch (error) {
            return {
                error: "Error creating queue",
            };
        }
    }

    public async sendMessage(msg: string): Promise<string | { error: string }> {
        const params = {
            QueueUrl: process.env.QUEUE_URL,
            MessageBody: msg,
        };
        const command = new SendMessageCommand(params);

        const response = await this.sqs.send(command);
        if (response.MessageId) {
            return response.MessageId;
        }

        return { error: "Message not sent" };
    }
}
