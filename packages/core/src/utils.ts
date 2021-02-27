import _get = require('lodash.get')
import crypto = require('crypto')
import tinydate = require('tinydate')
import slugify = require('slug')
import path = require('path')
import fs = require('fs')

export function isClass(cls) {
    return typeof cls === 'function'
        && cls.toString().substr(0, 5).toLowerCase() === 'class'
}

export function asyncWrap(fn) {
    if (Array.isArray(fn)) {
        return fn.map((f) => asyncWrap(f))
    }

    if (typeof fn !== 'function') {
        return fn
    }

    // Skip if its a router (Need something more better)
    if (fn.name === 'router' && fn.stack) {
        return fn
    }

    // We skip async wrap for error handler
    if (fn.name === 'errorHandler') {
        return fn
    }

    return function (...args) {
        const next = args[args.length - 1]
        const ret = fn(...args)
        return Promise.resolve(ret).catch(next)
    }
}

export function date(val, inputFormat?): string {
    const format = inputFormat || '{YYYY}. {MM}. {DD}.'
    const formatter = tinydate(format, {
        DD: (d) => d.getDate()
    })
    return formatter(val)
}

export function slug(val): string {
    return slugify(val, { lower: true })
}

export function getPath(obj, path): any {
    return _get(obj, path)
}

export function createToken(): string {
    return crypto
        .createHmac('sha256', crypto.randomBytes(5).toString('hex'))
        .digest()
        .toString('hex')
}

export function autoload(dir, cb?) {
    const files = fs.readdirSync(dir)

    files
        .filter(name => name.endsWith('.js'))
        .map(name => {
            const content = require(path.join(dir, name))

            if (cb && typeof cb === 'function') {
                cb(content, name.replace('.js', ''))
            }
        })
}

export function pick(obj: any, fields: string[], merge?: any) {
    const res = fields.reduce((acc, field) => {
        acc[field] = obj[field]
        return acc
    }, {})

    if (merge) {
        return Object.assign(res, merge)
    }

    return res
}

export function random(bytes = 16): Promise<string> {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(bytes, (err, buffer) => {
            if (err) {
                reject(err)
            }
            resolve(buffer.toString('base64'))
        })
    })
}

export function thumbnailPath (input, size = 'medium') {
    if (typeof input !== 'string') {
        return ''
    }
    const re = /[^/\\&?]+\.\w{3,4}(?=([?&].*$|$))/
    const url = input.replace(re, '')
    let file = input.match(re)
    if (file) {
        file = file[0] as any
    }

    return `${url}${size}/${file}`
}

