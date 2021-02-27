import { Request, Response, NextFunction } from '../types'

export function setIsJson() {
    return (req: Request, res: Response, next: NextFunction) => {
        req.isJson = req.headers.accept && req.headers.accept.includes('application/json')
        next()
    }
}
