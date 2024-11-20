const log4js = require('log4js');

log4js.configure({
    appenders: {
        console: {
            type: 'stdout',
            layout: {
                type: "pattern",
                pattern: "%d %[[%p]%] %c - %m"
            }
        },
        api: {
            type: 'dateFile',
            filename: './logs/api.log',
            layout: {
                type: "pattern",
                pattern: " %d [%p] %c %X{ip}|%X{username} %X{method} %X{url} - %m "

            }
        }
    },
    categories: {
        default: {
            appenders: ['console', 'api'],
            level: 'debug', enableCallStack: true
        },
        api: {
            appenders: ['api'],
            level: 'debug'
        }
    }
});

module.exports = {
    default: log4js.getLogger(),
    api: log4js.getLogger('api')
};