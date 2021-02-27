import * as assert from 'assert'
import * as fs from 'fs'
import * as path from 'path'
import { Config, container } from '@dynejs/core'
import { Image } from '../src'

container.register(Config)
container.register(Image)

const image = container.resolve(Image)

describe('Image', () => {
    it('should resize an image', async () => {
        await image.resize('large', 'test-img.png')
        const newImage = path.join(process.cwd(), 'test/images/large/test-img.png')
        assert(fs.existsSync(newImage))
    })
})
