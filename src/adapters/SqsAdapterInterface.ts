export interface SqsAdapterInterface {
    sendMessage(msg: string): Promise<string | { error: string }>;
    createQueue(name: string): Promise<{ success: string } | { error: string }>;
}
