export class ValidationError extends Error {
    
    code: number

    constructor(message: any) {
        super()
        this.name = 'ValidationError'
        this.message = message
        this.code = 422
    }
}