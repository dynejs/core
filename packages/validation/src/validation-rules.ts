const URLRE = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})$/

const EMAILRE = /^([A-Za-z0-9_\-.+])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,})$/
const HEXRE = /^#([0-9a-f]{3}){1,2}$/i

export function boolean(val: unknown, param: any, fieldKey: string) {
    if (val === true || val === false || val === undefined) {
        return true
    }
    return makeError(fieldKey, 'boolean')
}

export function notNull(val, param, fieldKey) {
    if (val === undefined) {
        return true
    }
    if (val !== null) {
        return true
    }
    return makeError(fieldKey, 'notNull')
}

export function required(val, param, fieldKey) {
    if (Array.isArray(val) && val.length > 0) {
        return true
    }
    if (val === 0) {
        return true
    }
    if (val && !Array.isArray(val)) {
        return true
    }
    return makeError(fieldKey, 'required')
}

export function list(val, params, fieldKey, data) {
    if (data[fieldKey] === undefined) {
        return true
    }
    if (Array.isArray(params) && params.indexOf(val) !== -1) {
        return true
    }
    return makeError(fieldKey, 'list')
}

export function number(val, param, fieldKey) {
    if (!Number.isNaN(Number(val))) {
        return true
    }
    return makeError(fieldKey, 'number')
}

export function min(val, param, fieldKey) {
    const isNan = Number.isNaN(Number(val))
    if (isNan && val.length >= param[0]) {
        return true
    }
    if (Number(val) >= param[0]) {
        return true
    }
    return makeError(fieldKey, 'min')
}

export function max(val, param, fieldKey) {
    const isNan = Number.isNaN(Number(val))
    if (isNan && val.length >= param[0]) {
        return true
    }
    if (Number(val) <= param[0]) {
        return true
    }
    return makeError(fieldKey, 'max')
}

export function url(val, param, fieldKey) {
    if (URLRE.test(val)) {
        return true
    }

    return makeError(fieldKey, 'url')
}

export function email(val, param, fieldKey) {
    if (EMAILRE.test(val)) {
        return true
    }

    return makeError(fieldKey, 'email')
}

export function hex(val, param, fieldKey) {
    if (HEXRE.test(val)) {
        return true
    }

    return makeError(fieldKey, 'hex')
}

function makeError(fieldKey, name) {
    return `validation.${fieldKey}.${name}`
}