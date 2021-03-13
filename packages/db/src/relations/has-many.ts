import * as Knex from 'knex'
import { RelationBuilderApi, RelationMetadata } from '../types/relation'
import { Repo } from '../repo'

export function hasMany(repo: typeof Repo, meta: RelationMetadata): RelationBuilderApi {
    return {
        buildQuery(result, query: Knex.QueryBuilder) {
            const whereIds = result.map(item => item[meta.localKey]) as string[]
            query.whereIn(meta.foreignKey, whereIds)
        },

        async appendResult(field, result, relatedResult): Promise<any> {
            result.forEach(item => {
                const res = relatedResult.filter(relatedItem => {
                    return item[meta.localKey] === relatedItem[meta.foreignKey]
                })
                item[field] = repo.$format(res)
            })
        }
    }
}
