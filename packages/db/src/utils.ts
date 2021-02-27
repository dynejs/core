export function findTop(obj): string[] {
    if (!obj) {
        return []
    }
    return obj
        .reduce((res, el) => {
            if (el.split('.').length === 1) {
                res.push(el)
            }
            return res
        }, [])
}

export function findSiblings(obj, path): string[] {
    const prefix = path + '.'
    if (!obj) {
        return []
    }
    return obj
        .reduce((res, el) => {
            if (el.startsWith(prefix)) {
                res.push(el.replace(prefix, ''))
            }
            return res
        }, [])
}
