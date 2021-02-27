import get = require('lodash.get')
import * as validationRules from './validation-rules'
import { ValidationError } from './exception'

export class Validator {

    constructor(data, rules) {
        if (!rules || typeof rules !== 'object') {
            throw new Error('Validation rules not defined or incorrect')
        }

        this.run(data, rules)
    }

    run(data, rules) {
        const fields = this.buildFields(rules, data)
        const errors = {}

        for (const fieldKey in fields) {
            const val = get(data, fieldKey)
            const fieldRules = this.parseRules(fields[fieldKey])

            fieldRules.forEach((rule) => {
                const validationFn = validationRules[rule.name]

                if (!validationFn) {
                    return
                }

                const result = validationFn(val, rule.params, fieldKey, data)

                if (typeof result === 'string') {
                    const err = errors[fieldKey]

                    if (!err) {
                        errors[fieldKey] = []
                    }

                    errors[fieldKey].push(result)
                }
            })
        }
        if (Object.keys(errors).length > 0) {
            throw new ValidationError(errors)
        }
    }

    buildFields(rules, data) {
        const fields = {}
        for (const i in rules) {
            if (i.includes('*')) {
                // Building new keys to fields to "match many"
                this.buildArrayRules(i, data).forEach((key) => {
                    fields[key] = rules[i]
                })
            } else {
                fields[i] = rules[i]
            }
        }
        return fields
    }

    buildArrayRules(field, data, finalKeys = []) {
        const ndx = field.indexOf('*')

        const keyBegin = field.slice(0, ndx - 1)
        const keyEnd = field.slice(ndx + 2, field.length)
        const dataSet = get(data, keyBegin) || []

        // Build the first iteration for asterisk
        const mayContain = []
        for (const i in dataSet) {
            mayContain.push(`${keyBegin}.${i}.${keyEnd}`)
        }

        // Recursive check and build for more nested array rule
        if (mayContain.length > 0 && mayContain[0].includes('*')) {
            for (let j = 0; j < mayContain.length; j++) {
                const hasMore = this.buildArrayRules(mayContain[j], data, finalKeys)
                finalKeys = finalKeys.concat(hasMore)
            }
        } else {
            finalKeys = mayContain
        }

        return finalKeys
    }

    parseRules(definition) {
        return definition.split('|').map((rule) => {
            const [name, params] = rule.split(':')
            return {
                name,
                params: params ? params.split(',') : null
            }
        })
    }
}

export const validate = (data, rules) => new Validator(data, rules)
