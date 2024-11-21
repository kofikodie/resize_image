import request from 'supertest';
import app from '../src/app';
import S3Adapter from '../src/adapters/S3Adapter';
import SQSAdapter from '../src/adapters/SqsAdapter';

describe('POST /upload', () => {
    beforeAll(() => {
        const s3 = new S3Adapter();
        s3.createBucket(process.env.BUCKET_NAME_TMP ?? '');

        const sqs = new SQSAdapter();
        sqs.createQueue(process.env.QUEUE_NAME ?? '');
    });

    it('should upload a single image and return a key', async () => {
        const s3 = new S3Adapter();
        const sqs = new SQSAdapter();
        const testImage = 'test/test-image.png';
        const uploadUrl = '/upload';
        const mockFile = {
            name: 'test-image.png',
            mimetype: 'image/png',
                data: Buffer.from('test image data'),
        };

        const response = await request(app)
            .post(uploadUrl)
            .attach('image', mockFile.data, mockFile.name);

        expect(response.status).toEqual(200);
        expect(response.body).toHaveLength(1);
        expect(typeof response.body[0]).toEqual('string');

        const result = await s3.getImageByKey(process.env.BUCKET_NAME_TMP ?? '', response.body[0]);
        expect(result).toBeDefined();
        expect(Buffer.from(result as Buffer).toString('utf-8')).toEqual('test image data');

        const message = await sqs.getMessage();
        expect(message).toBeDefined();

        await s3.deleteImageByKey(process.env.BUCKET_NAME_TMP ?? '', response.body[0]);
    });

    it('should upload multiple images and return multiple keys', async () => {
        const s3 = new S3Adapter();
        const sqs = new SQSAdapter();
        const testImages = [
            'test/test-image-1.png',
            'test/test-image-2.png',
            'test/test-image-3.png',
        ];
        const uploadUrl = '/upload';
        const mockFiles = testImages.map((image) => ({
            name: image,
            mimetype: 'image/png',
            data: Buffer.from(`test image data for ${image}`),
        }));

        const response = await request(app)
            .post(uploadUrl)
            .attach('image', mockFiles[0].data, mockFiles[0].name)
            .attach('image', mockFiles[1].data, mockFiles[1].name)
            .attach('image', mockFiles[2].data, mockFiles[2].name);

        expect(response.status).toEqual(200);
        expect(response.body).toHaveLength(3);
        expect(typeof response.body[0]).toEqual('string');
        expect(typeof response.body[1]).toEqual('string');
        expect(typeof response.body[2]).toEqual('string');

        const results = await Promise.all(
        response.body.map(async (key: string, index: any) => {
            const result = await s3.getImageByKey(process.env.BUCKET_NAME_TMP ?? '', key);
            expect(result).toBeDefined();
            const savedImage = Buffer.from(result as Buffer).toString('utf-8');
            const isImageSent = [
                `test image data for ${testImages[0]}`,
                `test image data for ${testImages[1]}`,
                `test image data for ${testImages[2]}`,
            ].includes(savedImage);

            expect(isImageSent).toBeTruthy();
            await s3.deleteImageByKey(process.env.BUCKET_NAME_TMP ?? '', key);
        })
        );

        const messages = await Promise.all(testImages.map(async (image) => {
            const message: any = await sqs.getMessage();
            expect(message).toBeDefined();
            return message;
            }));

        await Promise.all(messages.map(async (message) => {
            //@ts-ignore
            await sqs.deleteMessage(message.ReceiptHandle);
        }));
    });
});
