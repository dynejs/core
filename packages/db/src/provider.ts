import { Provider, Config, Command } from '@dynejs/core'
import { Connection } from './connection'
import { Migrator } from './migrator'
import { Migration } from './commands/migration'

export class DatabaseProvider extends Provider {

    register() {
        this.registerConnection()
        this.registerMigrator()

        this.app.resolve(Command).register(Migration)
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
