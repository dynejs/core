import { Request, Response, NextFunction } from '../types'

export function setBasePath() {
    return (req: Request, res: Response, next: NextFunction) => {
        // res.locals.currentUrl = new url.URL(req.url, this.config.get('url')).pathname
        res.locals.currentUrlParams = req.query
        next()
    }
}
