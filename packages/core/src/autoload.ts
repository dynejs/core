import * as fs from 'fs'
import * as path from 'path'

/**
 * Autoload is a synchronous file loader
 * to load exported classes from a folder
 * into an object
 */
export class Autoload {

    static load(dir: string) {
        const result = this.readDir(dir)
        return this.readObjects(result)
    }

    private static readDir(dir, out = []) {
        const contents = fs.readdirSync(dir)

        for (const entity of contents) {
            const file = path.join(dir, entity)
            const stat = fs.statSync(file)

            if (stat && stat.isDirectory()) {
                this.readDir(file, out)
            } else {
                if (entity.indexOf('.d.ts') === -1 && entity !== 'index.js') {
                    out.push(file)
                }
            }
        }
        return out
    }

    private static readObjects(files: string[]) {
        let obj = {}
        for (const file of files) {
            const contents = require(file)
            if (typeof contents === 'object') {
                Object.keys(contents).forEach(key => {
                    obj[key] = contents[key]
                })
            }
        }
        return obj
    }
}
