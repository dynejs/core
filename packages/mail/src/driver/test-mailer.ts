import fs = require('fs')
import path = require('path')
import crypto = require('crypto')

export function testMailer() {
    function create(props) {
        const content = {
            from: props.from,
            to: props.to,
            subject: props.subject,
            content: props.html
        }
        const name = crypto.createHash('md5').digest('hex')
        const final = Object.keys(content).map(key => {
            return `${key.toUpperCase()}: ${content[key]}`
        })
        const dir = path.join(process.cwd(), 'mails')
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir)
        }
        fs.writeFileSync(path.join(process.cwd(), 'mails', name + '.txt'), final.join('\n'), 'utf8')
    }

    return create
}
