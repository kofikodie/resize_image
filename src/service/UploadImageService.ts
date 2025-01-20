import fileUpload from "express-fileupload";
import { ForBucketAdapterInterface } from "../adapters/ports/ForBucketAdapter.Interface";
import { ForQueueAdapterInterface } from "../adapters/ports/ForQueueAdapter.Interface";
import { UploadImageInterface } from "../controller/UploadImageController";
import { randomUUID } from "crypto";
import { DynamoDBAdapterInterface } from "../adapters/ports/ForMetadataDBAdapter.Interface";
import { LoggerInterface } from "../utils/logger/LoggerInterface";

export default class UploadImageService implements UploadImageInterface {
    messageBroker: ForQueueAdapterInterface;
    bucketService: ForBucketAdapterInterface;
    dynamoDBService: DynamoDBAdapterInterface;
    logger: LoggerInterface;
    constructor(
        messageBroker: ForQueueAdapterInterface,
        bucketService: ForBucketAdapterInterface,
        dynamoDBService: DynamoDBAdapterInterface,
        logger: LoggerInterface
    ) {
        this.messageBroker = messageBroker;
        this.bucketService = bucketService;
        this.dynamoDBService = dynamoDBService;
        this.logger = logger;
    }

    public async upload(
        image: fileUpload.UploadedFile,
        buctketName: string
    ): Promise<string | { error: string }> {
        const imageName = image.name;
        const imageToData = image.data;
        const storeImage = await this.bucketService.storeImage(
            imageToData,
            imageName,
            buctketName,
            randomUUID()
        );

        if ("objectKey" in storeImage) {
            const messageBrokerResult = this.messageBroker.sendMessage(
                storeImage.objectKey
            );

            const dynamoDBResult = this.dynamoDBService.putItem({
                id: randomUUID(),
                originalName: imageName,
                size: image.size,
                mimeType: image.mimetype,
                createdAt: new Date().toISOString(),
                status: "pending",
            });

            try {
                await Promise.all([messageBrokerResult, dynamoDBResult]);
            } catch (error) {
                this.logger.error("Error uploading image", { error });
                return { error: "Error uploading image" };
            }

            return storeImage.objectKey;
        }

        return { error: "Error sending message to SQS" };
    }
}
