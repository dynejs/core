import fs = require('fs')
import path = require('path')
import merge = require('lodash.merge')
import { Request, Response, NextFunction } from './types'

export interface TranslationConfig {
    dirs: string[]
    locale: string
    endpoint?: string
}

export class Translation {

    dictionary: {}
    config: TranslationConfig

    constructor(config: TranslationConfig) {
        this.config = config
        this.dictionary = {}

        if (!this.config.locale) {
            throw new Error('Translation locale is not set')
        }

        this.loadDirs()
    }

    get(path?: string | undefined) {
        if (!path) {
            return this.dictionary
        }
        return this.dictionary[path] || path
    }

    loadDirs() {
        this.config.dirs.forEach(dir => {
            this.loadDir(path.normalize(dir))
        })
    }

    loadDir(dir: string) {
        const localeDir = path.join(dir, this.config.locale)
        if (!fs.existsSync(localeDir)) {
            return
        }

        const dirContents = fs.readdirSync(localeDir)

        dirContents.forEach(file => {
            this.loadFile(path.join(localeDir, file))
        })
    }

    private loadFile(file: string) {
        if (!fs.existsSync(file)) {
            return
        }

        const loaded = require(file)
        merge(this.dictionary, loaded)
    }

    middleware() {
        return (req: Request, res: Response, next: NextFunction) => {
            res.locals.t = (key?: string) => this.get(key)

            if (req.url === this.config.endpoint) {
                return res.send(this.dictionary)
            }

            next()
        }
    }
}
