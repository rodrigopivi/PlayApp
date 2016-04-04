const ENV = process.env.NODE_ENV || 'development'
const settings = {
    common: {
        hostname: 'play.dev', // GQL queries and cookies are hardcoded to this hostname
        serverPort: 4242,
        mainEntryPort: 4242,
        allowGraphiQL: true,
        useServerCluster: false,
        jwt: { secret: 'secret', daysUntilExpire: 7 },
        db: {
            host: 'localhost',
            port: 28015,
            db: 'play',
            enforce_extra: 'remove',
            authKey: '',
            min: 5,
            max: 10,
            buffer: 5
        }
    },
    development: {
        webpackDevServerPort: 4242, // only used for development
        serverPort: 4241,
        mainEntryPort: 4242
    },
    production: {
        allowGraphiQL: false,
        useServerCluster: true
    }
}
module.exports = Object.assign(settings.common, settings[ENV])
