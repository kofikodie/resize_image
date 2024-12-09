import app from "./app";
import * as dotenv from "dotenv";

dotenv.config();

(async () => {
    try {
        if (
            !process.env.QUEUE_NAME ||
            !process.env.BUCKET_NAME ||
            !process.env.BUCKET_NAME_TMP
        ) {
            throw new Error(
                "Error creating queue, missing required env variables"
            );
        }

        const appPort = process.env.APP_PORT || 8888;
        app.listen(appPort, () => {
            console.log(`App listening on port ${appPort}`);
        });
    } catch (err) {
        console.error(err);
    }
})();
