import winston from 'winston';

export interface LoggerConfig {
    level: string;
    format: winston.Logform.Format;
    transports: winston.transport[];
}

export const defaultConfig: LoggerConfig = {
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
}; 