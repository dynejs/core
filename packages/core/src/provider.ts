import { App } from './application'

export abstract class Provider {

    app: App

    constructor(app: App) {
        this.app = app
    }

    register() {

    }

    boot() {

    }
}
