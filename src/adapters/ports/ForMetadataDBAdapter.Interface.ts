export interface ForMetadataDBAdapterInterface {
    id: string;
    originalName: string;
    size: number;
    mimeType: string;
    createdAt: string;
    status: "pending" | "processed" | "error";
}

export interface DynamoDBAdapterInterface {
    putItem(
        item: ForMetadataDBAdapterInterface
    ): Promise<{ success: boolean } | { error: string }>;
}
