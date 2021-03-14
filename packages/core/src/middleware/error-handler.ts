import { Request, Response } from '../types'
import { ErrorClient } from '../exception'

export function notFoundHandler() {
    return function notFoundHandler(req: Request, res: Response) {
        if (req.isJson) {
            res.status(404).send({error: 'Page not found'})
            return
        }
        res.status(404).render('404')
    }
}

export function errorHandler() {
    return function errorHandler(err: any, req: Request, res: Response, next) {
        if (process.env.NODE_ENV === 'development') {
            console.log(err)
            console.log(err.message)
        }

        if (req.isJson) {
            res.status(err.code || 500).send({error: err.message, stack: err.stack})
            return
        }

        req.flash('error', err.message)

        if (req.method.toLowerCase() === 'post') {
            req.flash('old', req.body)

            if(err instanceof ErrorClient) {
                return res.redirect(req.header('referer'))
            }
        }

        if (err.code === 403 && req.url !== '/login') {
            res.redirect('/login')
            return
        }

        if (err.code === 404 && req.method === 'GET') {
            return res.render('404')
        }

        res.status(err.code)
        res.render('error', {
            error: err,
            isDevelopment: process.env.NODE_ENV
        })
    }
}
