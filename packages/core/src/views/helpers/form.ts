import { getPath } from '../../utils'

export function old_checked() {
    return (value, field, options) => {
        if (value) {
            return 'checked'
        }
        if (options && options.data.old) {
            return getPath(options.data.old, field) ? 'checked' : ''
        }
        return ''
    }
}

export function old() {
    return (value, field, options) => {
        if (value) {
            return value
        }
        if (options && options.data.old) {
            return getPath(options.data.old, field)
        }
        return ''
    }
}

export function checked() {
    return (val1, val2) => {
        if (val1 === val2) {
            return 'checked'
        }
    }
}
