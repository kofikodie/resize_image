export interface S3AdapterInterface {
    storeImage(
        buffer: Buffer,
        imageName: string,
        buctketName: string,
        key: string
    ): Promise<{ objectKey: string } | { error: string }>;
    getImageByKey(bucketName: string, key: string): Promise<any>;
    createBucket(
        bucketName: string
    ): Promise<{ success: string } | { error: string }>;
}
