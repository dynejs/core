import { getPath } from '../../utils'

export function value() {
    return (obj, path) => {
        return getPath(obj, path)
    }
}
