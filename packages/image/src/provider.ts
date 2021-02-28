import { Provider, Config } from '@dynejs/core'
import { Image } from './image'

export class ImageProvider extends Provider {

    register() {
        const config = this.app.resolve(Config)
        const image = new Image(config.get('image', {}))
        this.app.use(image.middleware())
    }
}
