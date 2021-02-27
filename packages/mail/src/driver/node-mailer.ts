import nodemailer = require('nodemailer')
import { IMail, MailerOpts } from '../mailer'

export function nodeMailer(opts: MailerOpts) {
    const transport = nodemailer.createTransport({
        host: opts.host,
        port: opts.port,
        secure: opts.secure,
        auth: {
            user: opts.user,
            pass: opts.password
        }
    })

    return (props: IMail) => transport.sendMail(props)
}
