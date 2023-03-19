import sharp from "sharp";

export default class ResizeImageAdapter {
    resizeImage(imageBuffer: Buffer, width: number, height: number) {
        return sharp(imageBuffer).resize(width, height).toBuffer();
    }
}