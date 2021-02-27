import fs = require('fs')
import path = require('path')
import _merge = require('lodash.merge')
import _get = require('lodash.get')

export class Config {
    dictionary: any
    root: string

    constructor() {
        this.root = process.cwd()
        const defaultPath = this.configPath()
        this.dictionary = {
            root: defaultPath
        }
        if (fs.existsSync(defaultPath)) {
            this.load(defaultPath)
        }
    }

    reload() {
        this.load(this.configPath())
    }

    configPath(): string {
        return path.join(
            process.env.NODE_ENV === 'test' ? this.root + '/test' : this.root,
            'config.js'
        )
    }

    load(filePath) {
        if (!fs.existsSync(filePath)) {
            return
        }
        const base = require(filePath)
        this.merge(base)
    }

    get(key, def?) {
        return _get(this.dictionary, key) || def
    }

    merge(val) {
        if (typeof val === 'object') {
            _merge(this.dictionary, val)
        }
    }
}
