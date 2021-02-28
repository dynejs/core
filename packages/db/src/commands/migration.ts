import { CommandHandler } from '@dynejs/core'
import { Migrator } from '../migrator'

@CommandHandler('db')
export class Migration {

    private migrator: Migrator

    constructor(migrator: Migrator) {
        this.migrator = migrator
    }

    async handle(opts) {
        if (opts.migrate) {
            await this.migrator.migrate()
            return
        }
        if (opts.rollback) {
            await this.migrator.rollback()
            return
        }
        console.warn('You have to pass --migrate or --rollback to db command')
    }
}
