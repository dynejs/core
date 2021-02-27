import * as Knex from 'knex'
import { RelationBuilderApi, RelationMetadata } from '../types/relation'
import { Repo } from '../repo'

export function belongsTo(repo: Repo, meta: RelationMetadata): RelationBuilderApi {
    return {
        buildQuery(result, query: Knex.QueryBuilder) {
            const whereIds = result.map(item => item[meta.localKey]) as string[]
            query.whereIn(meta.foreignKey, whereIds)
        },

        appendResult(field, result, relatedResult) {
            result.forEach(item => {
                const res = relatedResult.find(relatedItem => {
                    return item[meta.localKey] === relatedItem[meta.foreignKey]
                })
                item[field] = repo.$format(res)
            })
        }
    }
}
