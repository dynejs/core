import * as _debug from 'debug'

export function debug(id: string) {
    return _debug('dyne:core')(id)
}
