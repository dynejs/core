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

        this.app.use('/' + route, this.app.staticMiddleware(imageConfig.baseDir, {
            maxAge: 1000000
        }))

        this.app.use(imageConfig.url, image.middleware())
    }
}
