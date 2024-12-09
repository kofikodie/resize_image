import fileUpload from "express-fileupload";
import { S3AdapterInterface } from "../adapters/S3AdapterInterface";
import { SqsAdapterInterface } from "../adapters/SqsAdapterInterface";
import { UploadImageInterface } from "../controller/UploadImageController";
import { randomUUID } from "crypto";

export default class UploadImageService implements UploadImageInterface {
    messageBroker: SqsAdapterInterface;
    bucketService: S3AdapterInterface;

    constructor(
        messageBroker: SqsAdapterInterface,
        bucketService: S3AdapterInterface
    ) {
        this.messageBroker = messageBroker;
        this.bucketService = bucketService;
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
            const result = await this.messageBroker.sendMessage(
                storeImage.objectKey
            );

            if (typeof result === "string") {
                return storeImage.objectKey;
            }
        }

        return { error: "Error sending message to SQS" };
    }
}
