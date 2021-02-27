export class ErrorClient extends Error {

    code: number
    content: any

    constructor(message, code = 500) {
        super()
        if (code) {
            this.code = code
        }
        if (typeof message !== 'string') {
            this.content = message
        }
        this.message = message
        this.name = 'ERR_CLIENT'
    }
}
