import { App, Provider } from '@dynejs/core'
import { DatabaseProvider, Migrator } from '../src'


new App([
    DatabaseProvider,
    class extends Provider {
        register() {}

        boot() {
            const migrator = this.app.resolve(Migrator)

            migrator.add(__dirname + '/migrations')
            migrator.migrate().then(() => {
                process.exit(0)
            }).catch(err => {
                console.log(err)
                process.exit(1)
            })
        }
    }
])
