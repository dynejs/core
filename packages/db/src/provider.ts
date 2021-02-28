import { Provider, Config } from '@dynejs/core'
import { Connection } from './connection'
import { Migrator } from './migrator'

export class DatabaseProvider extends Provider {

    register() {
        this.registerConnection()
        this.registerMigrator()
    }

    registerConnection() {
        const config = this.app.resolve(Config)
        this.app.registerFn(Connection, () => {
            return new Connection(config.get('database', {}))
        })
    }

    registerMigrator() {
        const connection = this.app.resolve(Connection)
        const migrator = new Migrator(connection.active())
        this.app.registerFn(Migrator, () => migrator)
    }
}
