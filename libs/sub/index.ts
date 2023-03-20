import cron from 'node-cron';
import S3Adapter from '../S3Adapter';
import SQSAdapter from '../SqsAdapter';
import ResizeImageAdapter from './ResizeImageAdapter';

cron.schedule('*/10 * * * * *', async () => {
    console.log('Running a task every 10 seconds');

    if (!process.env.BUCKET_NAME || !process.env.BUCKET_NAME_TMP) {
        console.log('BUCKET_NAME not provided');
        return;
    }

    const sqs = new SQSAdapter();

    const imageKey = await sqs.getMessage();
    
    if (!imageKey || 'error' in imageKey || !imageKey.Body || !imageKey.ReceiptHandle) {
        console.log('No message found');
        return;
    }

    const s3 = new S3Adapter();

    const imageBuffer = await s3.getImageByKey(process.env.BUCKET_NAME_TMP, imageKey.Body);
    if ('error' in imageBuffer) {
        console.log('Error downloading image', imageKey.Body, imageBuffer.error, imageKey);
        return;
    }

    const resizedBuffer = await new ResizeImageAdapter().resizeImage(imageBuffer, 100, 100);
    console.log(imageBuffer);
    const newKey = await s3.storeImage(resizedBuffer, `resized_${imageKey.Body}`, process.env.BUCKET_NAME, imageKey.Body);

    console.log(`Image resized and stored in ${process.env.BUCKET_NAME} with key ${newKey}`);

    Promise.all([
        s3.deleteImageByKey(process.env.BUCKET_NAME_TMP, imageKey.Body),
        sqs.deleteMessage(imageKey.ReceiptHandle),
    ]).then(() => {
        console.log('Image deleted from tmp bucket and message deleted from queue');
    })
});
