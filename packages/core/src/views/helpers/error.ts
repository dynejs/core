
export function error({ hbs }) {    
    return (options: any) => {

        let errors = null
        if (!options.data || !options.data.error) {
            return
        } else {
            errors = options.data.error
        }

        let final = errors

        if (errors[0] && typeof errors[0] === 'object') {
            final = Object.keys(errors[0]).reduce((res, field) => {
                res = res.concat(errors[0][field])
                return res
            }, [])        
        }

        if (!final.length) {
            return ''            
        }

        const messages = final.map(err => {
            return `<div>${err}</div>`
        }).join('\n')

        return new hbs.SafeString(`<div class="error">${messages}</div>`)
    }
}