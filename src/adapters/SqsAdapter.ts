import {
    SQSClient,
    SendMessageCommand,
    CreateQueueCommand,
} from "@aws-sdk/client-sqs";
import * as dotenv from "dotenv";
import { SqsAdapterInterface } from "./SqsAdapterInterface";
import { LoggerInterface } from "../utils/logger/LoggerInterface";

dotenv.config();

export default class SQSAdapter implements SqsAdapterInterface {
    private readonly sqs: SQSClient;
    private readonly logger: LoggerInterface;

    constructor(logger: LoggerInterface) {
        this.logger = logger;

        try {
            if (process.env.NODE_ENV === "production") {
                this.sqs = new SQSClient({
                    region: process.env.AWS_DEFAULT_REGION,
                });
                this.logger.info(
                    "Initialized SQS client for production environment"
                );
            } else {
                this.sqs = new SQSClient({
                    endpoint: process.env.AWS_SERVICES_ENDPOINT ?? "",
                    region: process.env.AWS_DEFAULT_REGION,
                    credentials: {
                        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
                        secretAccessKey:
                            process.env.AWS_SECRET_ACCESS_KEY ?? "",
                    },
                });
                this.logger.info(
                    "Initialized SQS client for local environment",
                    {
                        endpoint: process.env.AWS_SERVICES_ENDPOINT,
                        region: process.env.AWS_DEFAULT_REGION,
                    }
                );
            }
        } catch (error) {
            this.logger.error("Failed to initialize SQS client", {
                error: error instanceof Error ? error.message : String(error),
            });
            throw new Error("SQS client initialization failed");
        }
    }

    async createQueue(
        name: string
    ): Promise<{ success: string } | { error: string }> {
        const params = {
            QueueName: name,
        };

        try {
            this.logger.info(`Creating queue`, { name });
            const command = new CreateQueueCommand(params);
            const response = await this.sqs.send(command);

            if (!response.QueueUrl) {
                throw new Error("Queue URL not received in response");
            }

            this.logger.info(`Successfully created queue`, {
                name,
                queueUrl: response.QueueUrl,
            });

            return {
                success: response.QueueUrl,
            };
        } catch (error) {
            this.logger.error("Error creating queue", {
                name,
                error: error instanceof Error ? error.message : String(error),
            });
            return {
                error: `Failed to create queue: ${
                    error instanceof Error ? error.message : String(error)
                }`,
            };
        }
    }

    public async sendMessage(msg: string): Promise<string | { error: string }> {
        if (!process.env.QUEUE_URL) {
            this.logger.error("QUEUE_URL environment variable not set");
            return { error: "Queue URL not configured" };
        }

        const params = {
            QueueUrl: process.env.QUEUE_URL,
            MessageBody: msg,
        };

        try {
            this.logger.info("Sending message to queue", {
                queueUrl: params.QueueUrl,
                messageLength: msg.length,
            });

            const command = new SendMessageCommand(params);
            const response = await this.sqs.send(command);

            if (!response.MessageId) {
                throw new Error("Message ID not received in response");
            }

            this.logger.info("Successfully sent message", {
                messageId: response.MessageId,
                queueUrl: params.QueueUrl,
            });

            return response.MessageId;
        } catch (error) {
            this.logger.error("Error sending message", {
                queueUrl: params.QueueUrl,
                error: error instanceof Error ? error.message : String(error),
            });

            return {
                error: `Failed to send message: ${
                    error instanceof Error ? error.message : String(error)
                }`,
            };
        }
    }
}
