export function selected({hbs}) {
    return (val1, val2) => {
        return val1 === val2 ? 'selected' : ''
    }
}
