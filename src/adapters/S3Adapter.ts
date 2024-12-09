import {
    CreateBucketCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3,
} from "@aws-sdk/client-s3";
import { S3AdapterInterface } from "./S3AdapterInterface";
import * as dotenv from "dotenv";
import { StreamHelper } from "../stream-helpler";
import { Readable } from "node:stream";

dotenv.config();

export default class S3Adapter implements S3AdapterInterface {
    private readonly s3: S3;

    constructor() {
        if (process.env.RUNNING_ENV) {
            this.s3 = new S3({
                region: process.env.AWS_DEFAULT_REGION ?? "eu-west-1",
            });
        } else {
            this.s3 = new S3({
                endpoint: process.env.AWS_SERVICES_ENDPOINT ?? "",
                region: process.env.AWS_DEFAULT_REGION,
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
                },
                forcePathStyle: true,
            });
        }
    }

    async createBucket(
        bucketName: string
    ): Promise<{ success: string } | { error: string }> {
        const params = {
            Bucket: bucketName,
        };

        try {
            const command = new CreateBucketCommand(params);
            const response = await this.s3.send(command);

            return {
                success: response.Location!,
            };
        } catch (error: unknown) {
            return {
                error: "Error creating bucket",
            };
        }
    }

    async getImageByKey(
        bucketName: string,
        key: string
    ): Promise<Buffer | { error: string }> {
        const params = {
            Bucket: bucketName,
            Key: key,
        };

        try {
            const command = new GetObjectCommand(params);
            const response = await this.s3.send(command);

            return await StreamHelper.streamToBuffer(response.Body as Readable);
        } catch (error) {
            return { error: `${error}` }; //handle all types of error
        }
    }

    public async storeImage(
        buffer: Buffer,
        imageName: string,
        bucketName: string,
        key: string
    ): Promise<{ objectKey: string } | { error: string }> {
        const params = {
            Bucket: bucketName,
            Key: key,
            Name: imageName,
            Body: buffer,
        };

        try {
            const command = new PutObjectCommand(params);
            const result = await this.s3.send(command);

            if (result.$metadata.httpStatusCode === 200) {
                return {
                    objectKey: key,
                };
            }

            return { error: "Unable to upload object" };
        } catch (error: unknown) {
            return { error: `${error}` };
        }
    }
}
