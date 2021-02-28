import fs = require('fs')
import path = require('path')
import sharp = require('sharp')
import isImage = require('is-image')
import ReadableStream = NodeJS.ReadableStream
import { pathToRegexp } from 'path-to-regexp'

sharp.concurrency(2)
sharp.cache(false)

export interface IImageDimensions {
    width?: number
    height?: number
    fit?: 'cover' | 'container' | 'fill' | 'inside' | 'outside'
}

export interface ImageOpts {
    sizes: { [key: string]: IImageDimensions }
    url: string
    baseDir: string
}

export class Image {

    opts: ImageOpts
    regexp: any
    segments: any

    constructor(config: ImageOpts) {
        this.opts = config
        this.segments = []
        this.regexp = pathToRegexp(this.opts.url, this.segments)
    }

    resize(key: string, filename: string): ReadableStream {
        const dimensions = this.opts.sizes[key]

        if (!dimensions) {
            throw new Error(`Image size not found: ${key}`)
        }

        if (!dimensions.fit) {
            dimensions.fit = 'inside'
        }

        const baseDir = this.opts.baseDir
        const requestPath = path.join(baseDir, key)
        const requestedFile = path.join(requestPath, filename)
        const mainFile = path.join(baseDir, filename)
        const existsMain = fs.existsSync(mainFile)

        // No such files at all
        if (!existsMain || !isImage(mainFile)) {
            return null
        }

        // Main file exists, but not the resized one, we make a resize
        if (!fs.existsSync(requestPath)) {
            fs.mkdirSync(requestPath)
        }

        const transformer = sharp().resize(dimensions)

        const write = fs.createWriteStream(requestedFile)
        transformer.pipe(write)

        return fs.createReadStream(mainFile).pipe(transformer)
    }

    middleware() {
        return async (req, res) => {
            const size = req.params.size
            const name = req.params.name
            if (!name || !size) {
                throw new Error(`Error parsing image url segments, got: ${size}, ${name}`)
            }

            res.set('Cache-control', 'public, max-age=31557600')

            this.resize(size, name).pipe(res)
        }
    }
}
