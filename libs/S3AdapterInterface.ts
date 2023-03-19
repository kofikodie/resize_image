export interface S3AdapterInterface {
    storeImage(buffer: Buffer, imageName: string, buctketName: string): Promise<string>;
    storeImage(buffer: Buffer, imageName: string, buctketName: string, key: string): Promise<string>;
    createBucket(bucketName: string): Promise<string>;
    listBuckets(): Promise<string[]>;
    getImageByKey(bucketName: string, key: string): Promise<Buffer | { error: string}>;
    deleteImageByKey(bucketName: string, key: string): Promise<void>;
}