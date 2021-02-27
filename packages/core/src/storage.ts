import fs = require('fs')
import path = require('path')
import multer = require('multer')

export const storage = {
    root: process.cwd(),

    store(dir: string) {
        dir = path.join(this.root, dir)

        const uploader = getUploader(dir)
        const exists = fs.existsSync(dir)

        if (!exists && process.env.NODE_ENV !== 'test') {
            throw new Error(`Folder not exists: ${dir}`)
        }
        return uploader.single('file')
    },

    remove(filePath: string) {
        fs.unlinkSync(path.join(this.root, filePath))
    }
}

function getUploader(dir) {
    const diskStorage = multer.diskStorage({
        destination: (req, file, cb) => {
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
