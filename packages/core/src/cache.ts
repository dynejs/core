import crypto = require('crypto')
import path = require('path')
import fs = require('fs')
import { Config } from './config'
import { Injectable } from './decorators/injectable'

export interface CacheOpts {
    dir: string
    disabled: boolean
}

@Injectable()
export class Cache {

    dir: string
    opts: CacheOpts

    constructor(config: Config) {
        this.opts = config.get('cache', {})
        if (!this.opts.dir) {
            throw new Error('Cache target folder must be set')
        }
        this.dir = path.resolve(this.opts.dir)
    }

    async get(key: string, cb?: () => any, opts?: any): Promise<any> {
        const hashed = this.hash(key)
        if (this.opts.disabled) {
            return cb()
        }
        try {
            const contents = await fs.promises.readFile(path.join(this.dir, hashed), 'utf8')
            const now = Math.floor(Date.now() / 1000)
            const time = Number(contents.slice(0, 10))

            if (time < now) {
                this.flush(key)
                if (cb) {
                    const data = await cb()
                    await this.put(key, data, opts.ttl)
                    return data
                }
                return null
            }
            const data = contents.slice(10)
            return JSON.parse(data)
        } catch (e) {
            if (cb && typeof cb === 'function') {
                const data = await cb()
                await this.put(key, data)
                return data
            }
            return null
        }
    }

    async flush(key: string) {
        const hashed = this.hash(key)
        return this.flushFile(hashed)
    }

    async flushAll() {
        const promises: Promise<any>[] = await new Promise((resolve, reject) => {
            fs.readdir(this.dir, (err, contents) => {
                if (err) return reject(err)
                resolve(contents.map(file => this.flushFile(file)))
            })
        })
        return Promise.all(promises)
    }

    async put(key: string, value: any, time?: number) {
        const hashed = this.hash(key)
        const val = JSON.stringify(value)
        return fs.promises.writeFile(path.join(this.dir, hashed), this.getExpiration(time) + val, 'utf8')
    }

    hash(key: string) {
        return crypto.createHash('md5').update(key).digest('hex')
    }

    getExpiration(time?) {
        const minutes = (time || 60)
        const expiry = new Date()
        expiry.setMinutes(expiry.getMinutes() + minutes)
        return Math.floor(expiry.getTime() / 1000)
    }

    private flushFile(file): Promise<void> {
        return new Promise((resolve, reject) => {
            if (path.extname(file) !== '') {
                return resolve()
            }
            fs.unlink(path.join(this.dir, file), (err) => {
                if (err) return reject(err)
                resolve()
            })
        })
    }
}
