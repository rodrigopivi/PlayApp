import * as winston from 'winston'

export const logger: winston.LoggerInstance = new winston.Logger({
    level: 'debug', // silly, debug, verbose, info, warn, error
    emitErrs: true,
    transports: [
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            humanReadableUnhandledException: true,
            json: false,
            colorize: true
        })
        // ,new winston.transports.File({
        //     level: 'info', filename: 'logs/app.log', handleExceptions: true,
        //     maxsize: 5242880, maxFiles: 1, colorize: false, json: true
        // })
    ]
})
