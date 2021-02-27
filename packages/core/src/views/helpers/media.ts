import { thumbnailPath } from '../../utils'

export function thumbnail () {
    return (val, size, full) => {
        if (!val) {
            return '/default.png'
        }
        return thumbnailPath(val, size)
    }
}

export function background () {
    return (val, size) => {
        if (!val) {
            return ''
        }
        return `background-image: url('${thumbnailPath(val, size)}')`
    }
}
