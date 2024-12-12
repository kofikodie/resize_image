export interface LoggerInterface {
    info(message: string, meta?: Record<string, unknown>): void;
    error(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    debug(message: string, meta?: Record<string, unknown>): void;
    
    logApiRequest(method: string, path: string, meta?: Record<string, unknown>): void;
    logAwsOperation(service: string, operation: string, meta?: Record<string, unknown>): void;
    logError(error: Error, context: string, meta?: Record<string, unknown>): void;
} 