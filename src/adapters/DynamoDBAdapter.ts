import { DynamoDB } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBAdapterInterface,
    ImageMetadata,
} from "./DynamoDBAdapterInterface";
import * as dotenv from "dotenv";
import { LoggerInterface } from "../utils/logger/LoggerInterface";

dotenv.config();

export default class DynamoDBAdapter implements DynamoDBAdapterInterface {
    private readonly dynamodb: DynamoDB;
    private readonly tableName = "image_metadata";
    private readonly logger: LoggerInterface;

    constructor(logger: LoggerInterface) {
        this.logger = logger;

        try {
            if (process.env.NODE_ENV === "production") {
                this.dynamodb = new DynamoDB({
                    region: process.env.AWS_DEFAULT_REGION ?? "eu-west-1",
                });
                this.logger.info(
                    "Initialized DynamoDB client for production environment"
                );
            } else {
                this.dynamodb = new DynamoDB({
                    endpoint: process.env.AWS_SERVICES_ENDPOINT ?? "",
                    region: process.env.AWS_DEFAULT_REGION,
                    credentials: {
                        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
                        secretAccessKey:
                            process.env.AWS_SECRET_ACCESS_KEY ?? "",
                    },
                });
                this.logger.info(
                    "Initialized DynamoDB client for local environment"
                );
            }
        } catch (error) {
            logger.error("Failed to initialize DynamoDB client", { error });
            throw new Error("DynamoDB client initialization failed");
        }
    }

    async putItem(
        item: ImageMetadata
    ): Promise<{ success: boolean } | { error: string }> {
        try {
            this.logger.info("Putting item in DynamoDB", { id: item.id });

            await this.dynamodb.putItem({
                TableName: this.tableName,
                Item: {
                    id: { S: item.id },
                    originalName: { S: item.originalName },
                    size: { N: item.size.toString() },
                    mimeType: { S: item.mimeType },
                    createdAt: { S: item.createdAt },
                    status: { S: item.status },
                },
            });

            this.logger.info("Successfully put item in DynamoDB", {
                id: item.id,
            });
            return { success: true };
        } catch (error) {
            this.logger.error("Error putting item in DynamoDB", {
                id: item.id,
                error: error instanceof Error ? error.message : String(error),
            });
            return { error: "Failed to put item in DynamoDB" };
        }
    }
}
