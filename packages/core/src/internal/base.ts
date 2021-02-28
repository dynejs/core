import { Views } from '../views/views'
import { Config } from '../config'
import { Command } from '../command'
import { Router } from '../router'
import { Cache } from '../cache'
import { Provider } from '../provider'
import { setBasePath } from '../middleware/set-base-path'
import { Event } from '../event'
import { Dispatcher } from '../dispatcher'
import { Translation } from '../translation'

export class BaseProvider extends Provider {

    views: Views

    register() {
        this.app.register(Config)
        this.app.register(Cache)
        this.app.register(Views)
        this.app.register(Command)
        this.app.register(Router)
        this.app.register(Event)
        this.app.register(Dispatcher)

        this.views = this.app.resolve(Views)

        this.registerTranslation()
    }

    boot() {
        this.views.add(this.app.basePath('views'))

        this.app.use(setBasePath())
    }

    registerTranslation() {
        const config = this.app.resolve(Config)

        const translation = new Translation({
            locale: config.get('locale'),
            dirs: [process.cwd() + '/locales']
        })

        this.app.registerFn(Translation, () => translation)
    }
}
