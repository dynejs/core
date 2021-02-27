const {
    testMailer
} = require('../dist/driver/test-mailer')

module.exports = {
    url: 'http://localhost',
    mail: {
        host: '',
        port: '',
        user: '',
        pass: '',
        secure: false,
        driver: testMailer
    }
}