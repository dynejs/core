import { Config, Provider } from '@dynejs/core'
import { Translation } from './translation'

export class TranslationProvider extends Provider {

    register() {
        const config = this.app.resolve(Config)

        const translation = new Translation({
            locale: config.get('locale'),
            dirs: [process.cwd() + '/locales']
        })

        this.app.registerFn(Translation, () => translation)
    }
}
