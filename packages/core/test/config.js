module.exports = {
    database: {
        client: 'sqlite3',
        filename: './test.db'
    },

    cache: {
        dir: __dirname + '/cache'
    },

    service: {
        other: 'Keep this',
        key: 'aValue'
    }
}
