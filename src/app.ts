import express from "express";
import fileUpload from "express-fileupload";
import ForBucketAdapter from "./adapters/ForBucketAdapter";
import SqsAdapter from "./adapters/ForQueueAdapter";
import UploadImageController from "./controller/UploadImageController";
import UploadImageService from "./service/UploadImageService";
import fs from "fs";
import ForMetadataDBAdapter from "./adapters/ForMetadataDBAdapter";
import { LoggerService } from "./utils/logger/LoggerService";

const app = express();
app.use(fileUpload());

app.get("/healthy", (_req, res) => {
    res.status(200).send("OK");
});

app.post("/upload", async (req, res) => {
    const image = req.files?.image;

    if (!image) {
        return res.status(400).send("No file uploaded");
    }

    const uploadController = new UploadImageController(
        new UploadImageService(
            new SqsAdapter(LoggerService.getInstance()),
            new ForBucketAdapter(LoggerService.getInstance()),
            new ForMetadataDBAdapter(LoggerService.getInstance()),
            LoggerService.getInstance()
        )
    );

    let imagesKeys: string[] = [];

    if (Array.isArray(image)) {
        await Promise.all(
            image.map(async (file) => {
                const result = await uploadController.uploadImage(
                    file,
                    process.env.BUCKET_NAME_TMP ?? ""
                );
                if (typeof result === "string") {
                    imagesKeys.push(result);
                }
            })
        );
    } else {
        const result = await uploadController.uploadImage(
            image,
            process.env.BUCKET_NAME_TMP ?? ""
        );
        if (typeof result === "string") {
            imagesKeys.push(result);
        }
    }

    return res.status(200).send(imagesKeys);
});

app.get("/download/:key", async (req, res) => {
    const key = req.params.key;
    const s3 = new ForBucketAdapter(LoggerService.getInstance());
    const result = await s3.getImageByKey(process.env.BUCKET_NAME ?? "", key);

    if ("error" in result) {
        return res.status(404).send(result.error);
    }

    const buffer = Buffer.from(result as Buffer);
    const filename = `${key}.png`;

    try {
        fs.writeFileSync(filename, buffer);
        res.download(filename, (err) => {
            if (err) {
                console.error(`Error downloading file: ${err}`);
                res.status(500).send("Error downloading file");
            } else {
                fs.unlinkSync(filename);
            }
        });
    } catch (err) {
        console.error(`Error writing file: ${err}`);
        res.status(500).send("Error writing file");
    }
});

export default app;
