import { NextFunction, Response, Request } from '../types'
import { ErrorClient } from '../exception'

export function setSuccessResponse() {
    return (req: Request, res: Response, next: NextFunction) => {
        res.abort = function (code, message?) {
            message = message || 'Something went wrong'
            throw new ErrorClient(message, code)
        }
        res.success = function (result) {
            if(!!result) {
                res.send({ success: true })
            }
        }
        next()
    }
}
