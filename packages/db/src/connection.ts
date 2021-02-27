import * as Knex from 'knex'

export interface ConnectConfig {
    host?: string
    user?: string
    password?: string
    database?: string
    client?: string
    debug?: boolean
    filename?: string //Testing
}

export let activeConnection = null

export class Connection {

    config: ConnectConfig

    constructor(config: ConnectConfig) {
        this.config = config
        this.connect()
    }

    connect() {
        activeConnection = Knex({
            client: this.config.client || 'mysql',
            useNullAsDefault: true,
            debug: this.config.debug || false,
            connection: {
                host: this.config.host || '127.0.0.1',
                user: this.config.user || 'root',
                password: this.config.password || '',
                database: this.config.database || '',
                filename: this.config.filename || '127.0.0.1',
            }
        })
    }

    active() {
        return activeConnection
    }
}
