import { Provider, Config } from '@dynejs/core'
import { Image } from './image'

export class ImageProvider extends Provider {

    register() {
        const config = this.app.resolve(Config)
        const imageConfig = config.get('image', {})
        const image = new Image(imageConfig)
        const route = imageConfig.url.split('/')
            .slice(0, -2)
            .filter(segment => segment !== '')
            .join('/')

        // Static storage access
        this.app.static('/' + route, imageConfig.baseDir)

        // Image generation
        this.app.use(imageConfig.url, image.middleware())
    }
}
