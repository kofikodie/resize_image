import winston from 'winston';
import { LoggerConfig, defaultConfig } from './LoggerConfig';
import { LoggerInterface } from './LoggerInterface';

export class LoggerService implements LoggerInterface {
    private static instance: LoggerService;
    private logger: winston.Logger;

    private constructor(config: LoggerConfig = defaultConfig) {
        this.logger = winston.createLogger(config);
    }

    public static getInstance(): LoggerService {
        if (!LoggerService.instance) {
            LoggerService.instance = new LoggerService();
        }
        return LoggerService.instance;
    }

    public info(message: string, meta?: Record<string, unknown>): void {
        this.logger.info(message, meta);
    }

    public error(message: string, meta?: Record<string, unknown>): void {
        this.logger.error(message, meta);
    }

    public warn(message: string, meta?: Record<string, unknown>): void {
        this.logger.warn(message, meta);
    }

    public debug(message: string, meta?: Record<string, unknown>): void {
        this.logger.debug(message, meta);
    }

    public logApiRequest(
        method: string, 
        path: string, 
        meta?: Record<string, unknown>
    ): void {
        this.info(`API Request: ${method} ${path}`, meta);
    }

    public logAwsOperation(
        service: string,
        operation: string,
        meta?: Record<string, unknown>
    ): void {
        this.info(`AWS Operation: ${service} ${operation}`, meta);
    }

    public logError(
        error: Error,
        context: string,
        meta?: Record<string, unknown>
    ): void {
        this.error(`${context}: ${error.message}`, {
            ...meta,
            stack: error.stack,
            name: error.name
        });
    }
} 