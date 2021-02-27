import fs = require('fs')
import path = require('path')
import hbs = require('hbs')
import * as themeHelpers from './helpers'

export class Views {
    views: string[]

    cache: Map<string, (data: any) => string>

    hooks: Map<string, any>

    constructor() {
        this.views = []
        this.hooks = new Map()
        this.cache = new Map()
        this.loadHelpers()
    }

    /**
     * Retrieve the registered views
     */
    get() {
        return this.views
    }

    /**
     * Register base template helpers
     */
    loadHelpers() {
        Object.keys(themeHelpers).map(key => {
            hbs.registerHelper(key, themeHelpers[key]({hbs}))
        })
    }

    /**
     * Renders a view
     *
     * @param view template name
     * @param data data for the template
     */
    async render(view: string, data: any = {}): Promise<string> {
        let template = await this.getTemplate(view)

        if (!template) {
            throw new Error(`File not found in registered views: ${view}`)
        }

        let compiled: (data: any) => string = null


        data = Object.assign(data, {
            _layout: {}
        })

        if (this.cache.has(template)) {
            compiled = this.cache.get(template)
        }

        if (!compiled) {
            compiled = await this.compileTemplate(template)
            this.cache.set(template, compiled)
        }

        const content = await compiled(data)


        if (data._layout.layout) {
            const layout = await this.getTemplate(data._layout.layout)
            if (!layout) {
                throw new Error('Layout not found')
            }

            const layoutCompiled = await this.compileTemplate(layout)

            data.content = content
            return layoutCompiled(data)
        }

        return content
    }

    compileTemplate(template: string): Promise<(data: any) => string> {
        return new Promise((resolve, reject) => {
            fs.readFile(template, 'utf-8', (err, content) => {
                if (err) reject(err)

                resolve(hbs.compile(content))
            })
        })
    }

    async getTemplate(view): Promise<string> {
        let template = null
        for (const viewDir of this.views) {
            if (!template) {
                template = await this.checkTemplate(viewDir, view)
            }
        }
        return template
    }

    checkTemplate(viewDir, view): Promise<string | null> {
        const file = path.join(viewDir, `${view}.hbs`)
        return new Promise((resolve) => {
            fs.stat(file, (err) => {
                if (err) resolve(null)

                resolve(file)
            })
        })
    }

    async runHooks(view) {
        return [
            ...this.hooks.get('*'),
            ...this.hooks.get(view)
        ]
    }

    hook(view, callback) {
        this.hooks.set(view, (this.hooks.get('view') || []).push(callback))
    }

    /**
     * Register a helper
     *
     * @param name name of the helper
     * @param fn callback function which gets the handlebar instance
     */
    helper(name: string, fn: ({hbs}) => any) {
        hbs.registerHelper(name, fn({hbs}))
    }

    /**
     * Register a view directory
     *
     * @param dir
     */
    add(dir: string) {
        this.views.push(path.normalize(dir))

        const partialsDir = path.join(dir, 'partials')

        if (fs.existsSync(partialsDir)) {
            const files = fs.readdirSync(partialsDir)
            files.forEach(f => {
                const key = f.replace('.hbs', '').replace('-', '_')
                const fullPath = path.join(partialsDir, f)
                const content = fs.readFileSync(fullPath, 'utf8')
                hbs.registerPartial(key, content)
            })
        }
    }
}
