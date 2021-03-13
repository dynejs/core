import fs = require('fs')
import path = require('path')
import multer = require('multer')
import { config } from './utils'

export const storage = {
    store(dir: string) {
        const uploader = getUploader(dir)
        const exists = fs.existsSync(dir)

        if (!exists && process.env.NODE_ENV !== 'test') {
            throw new Error(`Folder not exists: ${dir}`)
        }
        return uploader.single('file')
    },

    remove(filePath: string) {
        const root = config('root')
        fs.unlinkSync(path.join(root, filePath))
    }
}

function getUploader(dir) {
    const diskStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            dir = path.join(config('root'), dir)
            cb(null, dir)
        },
        async filename(req, file, cb) {
            cb(null, file.originalname)
        }
    })
    return multer({
        storage: diskStorage
    })
}
