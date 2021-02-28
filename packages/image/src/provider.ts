import { Provider, Config } from '@dynejs/core'
import { Image } from './image'

export class ImageProvider extends Provider {

    register() {
        const config = this.app.resolve(Config)
        const image = new Image(config.get('image', {}))

        this.app.use('/storage', this.app.staticMiddleware('storage/public', {
            maxAge: 1000000
        }))

        this.app.use('/storage/:size/:name', image.middleware())
    }
}
