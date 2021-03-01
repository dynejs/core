import { NextFunction, Request as ExpressRequest, Response as ExpressResponse } from 'express'

export type Middleware = (req: Request, res: Response, next?: NextFunction) => void

export type Constructable<T = any> = (new (...args: any[]) => T)

export { NextFunction }

export interface Request extends ExpressRequest {
    isJson: boolean
    session: any
    flash: (name: string, value?: any) => void
    file?: { originalname: string, mimetype: string, size: number, filename: string }

    [key: string]: any
}

export interface Response extends ExpressResponse {
    renderPage: (view: string, data?: any, layout?: string) => void
    abort: (code: number, message?: string) => void
    success: (result: any) => void
}

export interface Handler {
    handle(payload?: any): Promise<any>
}
