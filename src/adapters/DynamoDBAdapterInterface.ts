export interface ImageMetadata {
    id: string;
    originalName: string;
    size: number;
    mimeType: string;
    createdAt: string;
    status: 'pending' | 'processed' | 'error';
}

export interface DynamoDBAdapterInterface {
    putItem(item: ImageMetadata): Promise<{ success: boolean } | { error: string }>;
} 