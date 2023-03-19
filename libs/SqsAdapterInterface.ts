import { Message } from 'aws-sdk/clients/sqs';

export interface SqsAdapterInterface {
    listQueues(): Promise<string[]>;
    createQueue(queueName: string): Promise<string | {error: string}>;
    sendMessage(msg: Message): Promise<string | {error: string}>;
    getMessage(): Promise<Message | undefined | {error: string}>;
    deleteMessage(receiptHandle: string): Promise<void>;
}
