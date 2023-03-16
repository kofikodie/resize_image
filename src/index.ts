import app from './app';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

(async () => {
    try {
        mongoose.connect(process.env.MONGO_URI || '');

        const appPort = process.env.APP_PORT || 8888;
        app.listen(appPort, () => {
            console.log(`App listening on port ${appPort}`);
        });
    } catch (err) {
        console.error(err);
    }
})();
