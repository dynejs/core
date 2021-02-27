import * as path from 'path'
import Knex = require('knex')

export class Migrator {

    db: Knex

    dirs: string[]

    constructor(db: Knex, dirs: string[] = []) {
        this.db = db
        this.dirs = dirs
    }

    add(dir: string) {
        this.dirs.push(path.normalize(dir))
    }

    async migrate() {
        if (this.dirs.length === 0) {
            console.log('No migrations dirs specified')
            return
        }
        await this.db.migrate.latest({
            disableMigrationsListValidation: true,
            directory: this.dirs
        })

        console.log('Migrated')

        return true
    }

    async rollback() {
        if (this.dirs.length === 0) {
            console.log('No migrations dirs specified')
            return
        }
        await this.db.migrate.rollback({
            disableMigrationsListValidation: true,
            directory: this.dirs
        })

        console.log('Rolled back')

        return true
    }
}
