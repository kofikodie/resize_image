import app from './app';
import * as dotenv from 'dotenv';
import SQSAdapter from "./adapters/SqsAdapter";
import S3Adapter from './adapters/S3Adapter';
dotenv.config();

(async () => {
    try {
        if (!process.env.QUEUE_NAME || !process.env.BUCKET_NAME || !process.env.BUCKET_NAME_TMP) {
            throw new Error('Error creating queue, missing required env variables');
        }

        const sqs = new SQSAdapter();
        const s3 = new S3Adapter();

        const queues = await sqs.createQueue(process.env.QUEUE_NAME);
        await s3.createBucket(process.env.BUCKET_NAME);
        await s3.createBucket(process.env.BUCKET_NAME_TMP);
        
        if (typeof queues !== 'string') {
            throw new Error('Error creating resources');
        }

        const appPort = process.env.APP_PORT || 8888;
        app.listen(appPort, () => {
            console.log(`App listening on port ${appPort}`);
        });
    } catch (err) {
        console.error(err);
    }
})();
