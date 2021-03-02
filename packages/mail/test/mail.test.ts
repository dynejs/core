import * as fs from 'fs'
import * as path from 'path'
import assert = require('assert')
import { Container, Config } from '@dynejs/core'
import { Mailer } from '../src'

const container = new Container()

let mailer: Mailer

before(() => {
    container.register(Config)
    const config = container.resolve(Config)

    container.registerFn(Mailer, () => {
        return new Mailer({
            url: config.get('url', null),
        ...config.get('mail', {})
        })
    })

    mailer = container.resolve(Mailer)
})


const html = `
<style>
.test {
    border: 1px solid red;
}
</style>
<div class="test">Hello world</div>
`

describe('Mail', () => {
    it('should send an email', async function() {
        await mailer.send({
            to: 'recepient@test.com',
            subject: 'Test email',
            content: html,
            from: 'test@host.com'
        })

        const files = fs.readdirSync(path.join(process.cwd(), 'mails'))
        const file = files[0]
        const content = fs.readFileSync(path.join(process.cwd(), 'mails', file), 'utf8')
        const lines = content.split('\n').filter(_ => _)

        assert(lines[0] === 'FROM: test@host.com')
        assert(lines[1] === 'TO: recepient@test.com')
        assert(lines[2] === 'SUBJECT: Test email')
        assert(lines[4] === '<div class="test" style="border: 1px solid red;">Hello world</div>')
    })
})
