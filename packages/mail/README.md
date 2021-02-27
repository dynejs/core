# Dyne Mail

A simple mail on top of nodemailer with css extracting. 

Usage:

```ts
const { Mailer, nodeMailer } = require('@dynejs/mail')

const mailer = new Mailer({
    url: 'http://localhost',
    host: 'smpt.mailtrap.io',
    port: '2525',
    user: 'user',
    pass: 'password',
    secure: false,
    driver: nodeMailer
})

await mailer.send({
    to: 'test@user.com',
    from: 'sender@user.com',
    subject: 'Test email',
    content: `
        <style>
        .wrapper {
            padding: 20px;
        }
        </style>
        <div class="wrapper">Content</div>
    `
})
```

The css classes will be transformed into styles on the content property:
```js
<div class="wrapper" style="padding: 20px;">Content</div>
```
