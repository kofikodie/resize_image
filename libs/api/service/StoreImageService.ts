export default class StoreImageAdapter {
    private readonly image: StoreImageInterface;

    constructor(image: StoreImageInterface) {
        this.image = image;
    }

    public async storeImage(buffer: Buffer): Promise<string> {
        return this.image.storeImage(buffer);
    }
}

export interface StoreImageInterface {
    storeImage(buffer: Buffer): Promise<string>;
}