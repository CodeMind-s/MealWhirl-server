const { createLogger, format, transports } = require('winston');
const chalk = require('chalk');

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message }) => {
            let consoleMessage = `[node] - ${timestamp} ${level.toUpperCase()} [ORDER-SERVICE] ${message}`;
            let colouredConsoleMessage;

            switch (level) {
                case 'info':
                    colouredConsoleMessage = chalk.green(consoleMessage);
                    break;
                case 'warn':
                    colouredConsoleMessage = chalk.yellow(consoleMessage);
                    break;
                case 'error':
                    colouredConsoleMessage = chalk.red(consoleMessage);
                    break;
                default:
                    colouredConsoleMessage = consoleMessage;
            }

            return colouredConsoleMessage;
        })
    ),
    transports: [new transports.Console()],
});

module.exports = logger;