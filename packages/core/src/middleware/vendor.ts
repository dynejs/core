import compression = require('compression')
import connect = require('connect-flash')
import cookieParser = require('cookie-parser')
import express = require('express')
import expressSession = require('express-session')

export function vendor() {
    return [
        connect(),
        compression(),
        express.json(),
        express.urlencoded({
            extended: true
        }),
        cookieParser(),
        expressSession({
            secret: 'COpyCaT', // @TODO
            resave: false,
            saveUninitialized: false,
            cookie: {
                path: '/',
                sameSite: 'lax',
                httpOnly: true,
                maxAge: 3600000 * 24,
                secure: false
            }
        })
    ]
}
