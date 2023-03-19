import {UploadedFile} from "express-fileupload";

export default class UploadImageController {
    private readonly image: UploadImageInterface;

    constructor(image: UploadImageInterface) {
        this.image = image;
    }

    public async uploadImage(image: UploadedFile | UploadedFile[], buctketName: string): Promise<string | {error: string}> {
        return this.image.upload(image, buctketName);
    }
}

export interface UploadImageInterface {
    upload(image: UploadedFile | UploadedFile[], buctketName: string): Promise<string | {error: string}>;
}
