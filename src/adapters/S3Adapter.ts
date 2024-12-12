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
import { LoggerInterface } from "../utils/logger/LoggerInterface";

dotenv.config();

export default class S3Adapter implements S3AdapterInterface {
    private readonly s3: S3;
    private readonly logger: LoggerInterface;

    constructor(logger: LoggerInterface) {
        this.logger = logger;
        try {
            if (process.env.NODE_ENV === "production") {
                this.s3 = new S3({
                    region: process.env.AWS_DEFAULT_REGION ?? "eu-west-1",
                });
                this.logger.info(
                    "Initialized S3 client for production environment"
                );
            } else {
                this.s3 = new S3({
                    endpoint: process.env.AWS_SERVICES_ENDPOINT ?? "",
                    region: process.env.AWS_DEFAULT_REGION,
                    credentials: {
                        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
                        secretAccessKey:
                            process.env.AWS_SECRET_ACCESS_KEY ?? "",
                    },
                    forcePathStyle: true,
                });
                this.logger.info("Initialized S3 client for local environment");
            }
        } catch (error) {
            logger.error("Failed to initialize S3 client", { error });
            throw new Error("S3 client initialization failed");
        }
    }

    async createBucket(
        bucketName: string
    ): Promise<{ success: string } | { error: string }> {
        const params = {
            Bucket: bucketName,
        };

        try {
            this.logger.info(`Creating bucket: ${bucketName}`);
            const command = new CreateBucketCommand(params);
            const response = await this.s3.send(command);

            this.logger.info(`Successfully created bucket: ${bucketName}`, {
                location: response.Location,
            });
            return {
                success: response.Location!,
            };
        } catch (error) {
            this.logger.error("Error creating bucket", {
                bucket: bucketName,
                error: error instanceof Error ? error.message : String(error),
            });
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
            this.logger.info(`Fetching image`, { bucket: bucketName, key });
            const command = new GetObjectCommand(params);
            const response = await this.s3.send(command);

            if (!response.Body) {
                throw new Error("Empty response body");
            }

            const buffer = await StreamHelper.streamToBuffer(
                response.Body as Readable
            );
            this.logger.info(`Successfully retrieved image`, {
                bucket: bucketName,
                key,
                size: buffer.length,
            });
            return buffer;
        } catch (error) {
            this.logger.error("Error retrieving image", {
                bucket: bucketName,
                key,
                error: error instanceof Error ? error.message : String(error),
            });
            return {
                error: `Failed to retrieve image: ${
                    error instanceof Error ? error.message : String(error)
                }`,
            };
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
            this.logger.info(`Storing image`, {
                bucket: bucketName,
                key,
                name: imageName,
                size: buffer.length,
            });

            const command = new PutObjectCommand(params);
            const result = await this.s3.send(command);

            if (result.$metadata.httpStatusCode === 200) {
                this.logger.info(`Successfully stored image`, {
                    bucket: bucketName,
                    key,
                    name: imageName,
                });
                return {
                    objectKey: key,
                };
            }

            throw new Error(
                `Unexpected status code: ${result.$metadata.httpStatusCode}`
            );
        } catch (error) {
            this.logger.error("Error storing image", {
                bucket: bucketName,
                key,
                name: imageName,
                error: error instanceof Error ? error.message : String(error),
            });
            return {
                error: `Failed to store image: ${
                    error instanceof Error ? error.message : String(error)
                }`,
            };
        }
    }
}
