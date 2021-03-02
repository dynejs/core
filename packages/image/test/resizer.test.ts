import * as assert from 'assert'
import * as fs from 'fs'
import * as path from 'path'
import { Container } from '@dynejs/core'
import { Image } from '../src'

const container = new Container()

let image: Image

before(() => {
    container.registerFn(Image, () => {
        return new Image({
            baseDir: __dirname + '/images',
            url: '/storage/:size/:name',
            sizes: {
                large: {
                    width: 600,
                    height: 600
                }
            }
        })
    })

    image = container.resolve(Image)
})

describe('Image', () => {
    it('should resize an image', async () => {
        await image.resize('large', 'test-img.png')
        const newImage = path.join(process.cwd(), 'test/images/large/test-img.png')
        assert(fs.existsSync(newImage))
    })
})
