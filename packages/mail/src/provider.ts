import { Config, Provider } from '@dynejs/core'
import { Mailer } from './mailer'

export class MailerProvider extends Provider {

    register() {
        const config = this.app.resolve(Config)

        const mailer = new Mailer({
            url: config.get('url', null),
            ...config.get('mail', {})
        })

        this.app.registerFn(Mailer, () => mailer)
    }
}
