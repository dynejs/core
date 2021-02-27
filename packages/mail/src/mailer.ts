import inlineCss = require('inline-css')
import { nodeMailer } from './driver/node-mailer'

export interface IMail {
    from?: string
    to: string
    subject: string
    content: string
}

export interface MailerOpts {
    host: string
    port: string
    secure: boolean
    user: string
    password: string
    url: string
    driver: any
    from?: string
}

export class Mailer {
    opts: MailerOpts

    constructor(config: MailerOpts) {
        this.opts = config
    }

    async send(props: IMail) {
        const mail = this.getDriver()
        const { from, to, subject, content } = props
        const final = await this.styling(content)

        return mail({
            from: from || this.opts.from,
            to,
            subject: subject || '',
            html: final
        })
    }

    getDriver() {
        if (this.opts.driver) {
            return this.opts.driver(this.opts)
        }
        return nodeMailer(this.opts)
    }

    styling(layout: string) {
        return new Promise((resolve, reject) => {
            inlineCss(layout, { url: this.opts.url })
                .then(resolve)
                .catch(reject)
        })
    }
}
