import AWS, { S3 } from "aws-sdk";
import { S3AdapterInterface } from "./S3AdapterInterface";
import * as dotenv from 'dotenv'
import { randomUUID } from "crypto";

dotenv.config()

export default class S3Adapter implements S3AdapterInterface {
    private readonly s3: S3;

    constructor() {
        this.s3 = new S3(
            {
                endpoint: new AWS.Endpoint(process.env.AWS_SERVICES_ENDPOINT ?? ''),
                s3ForcePathStyle: true,
                region: process.env.AWS_DEFAULT_REGION,
                credentials: new AWS.Credentials(process.env.AWS_ACCESS_KEY_ID ?? '', process.env.AWS_SECRET_ACCESS_KEY ?? '')
            }
        );
    }

    public async storeImage(buffer: Buffer, imageName: string, bucketName: string, key = randomUUID()): Promise<string> {
        if (bucketName.length <= 0) {
            throw new Error('S3_BUCKET_NAME not provided');
        }

        const params = {
            Bucket: bucketName,
            Key: key,
            Name: imageName,
            Body: buffer,
        };

        const result = await this.s3.upload(params).promise();
        return result.Key;
    }

    public async createBucket(bucketName: string) {
        const params = {
            Bucket: bucketName,
        };

        return this.s3.createBucket(params).promise().then(() => {
            return 'Bucket created'
        }).catch((err) => {
            if (err.code === 'BucketAlreadyOwnedByYou') {
                return 'Bucket already exists';
            } else {
                throw new Error(err);
            }
        });
    }

    public async listBuckets(): Promise<string[]> {
        const data = await this.s3.listBuckets().promise();

        if (data.Buckets && data.Buckets.length > 0) {
            return data.Buckets.map(bucket => bucket.Name ?? '');
        }

        return [];
    }

    public async getImageByKey(bucketName: string, key: string): Promise<Buffer | { error: string}> {
        const params = {
            Bucket: bucketName,
            Key: key,
        };

        return this.s3.getObject(params).promise().then((data) => {
            if (data.Body) {
                return data.Body as Buffer;
            }

            return { error: 'Image not found' };
        }).catch((err) => {
            return { error: err };
        });
    }

    public async deleteImageByKey(bucketName: string, key: string): Promise<void> {
        const params = {
            Bucket: bucketName,
            Key: key,
        };

        await this.s3.deleteObject(params).promise();
    }
}