import SQS, {
  Message as SqsMessageInterface,
  CreateQueueRequest,
  SendMessageRequest,
  ReceiveMessageRequest,
  DeleteMessageRequest,
} from "aws-sdk/clients/sqs";
import AWS from "aws-sdk";
import * as dotenv from "dotenv";
import { SqsAdapterInterface } from "./SqsAdapterInterface";

dotenv.config();

interface Message {
  Body: string;
}

export default class SQSAdapter implements SqsAdapterInterface {
  private readonly sqs: SQS;

  constructor() {
    this.sqs = new SQS({
      endpoint: new AWS.Endpoint(process.env.AWS_SERVICES_ENDPOINT ?? ""),
      region: process.env.AWS_DEFAULT_REGION,
      credentials: new AWS.Credentials(
        process.env.AWS_ACCESS_KEY_ID ?? "",
        process.env.AWS_SECRET_ACCESS_KEY ?? ""
      ),
    });
  }

  public async listQueues(): Promise<string[]> {
    const data = await this.sqs.listQueues({}).promise();
    return data.QueueUrls ?? [];
  }

  public async createQueue(
    queueName: string
  ): Promise<string | { error: any }> {
    const params: CreateQueueRequest = {
      QueueName: queueName,
    };
    const data = await this.sqs.createQueue(params).promise();
    if (data.QueueUrl) {
      return data.QueueUrl;
    }

    return { error: data.$response.error };
  }

  public async sendMessage(msg: Message): Promise<string | { error: string }> {
    const params: SendMessageRequest = {
      MessageBody: msg.Body,
      QueueUrl: process.env.QUEUE_URL ?? "",
    };
    const data = await this.sqs.sendMessage(params).promise();

    if (data.MessageId) {
      return data.MessageId;
    }

    return { error: "Message not sent" };
  }

  public async getMessage(): Promise<SqsMessageInterface | { error: string }> {
    const params: ReceiveMessageRequest = {
      QueueUrl: process.env.QUEUE_URL ?? "",
    };

    const data = await this.sqs.receiveMessage(params).promise();
    if (data.Messages) {
      if (data.Messages[0].Body) {
        return {
          Body: data.Messages[0].Body,
          ReceiptHandle: data.Messages[0].ReceiptHandle!,
        };
      }
    }

    return { error: "Message not received" };
  }

  public async deleteMessage(receiptHandle: string): Promise<void> {
    if (!process.env.QUEUE_URL) {
      throw new Error("QUEUE_URL not provided");
    }

    const params: DeleteMessageRequest = {
      QueueUrl: process.env.QUEUE_URL,
      ReceiptHandle: receiptHandle,
    };
    await this.sqs.deleteMessage(params).promise();
  }
}
