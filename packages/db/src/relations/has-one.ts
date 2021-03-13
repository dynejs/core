import { QueryBuilder } from 'knex'
import { RelationBuilderApi, RelationMetadata } from '../types/relation'
import { Repo } from '../repo'

export function hasOne(repo: typeof Repo, meta: RelationMetadata): RelationBuilderApi {
    return {
        buildQuery(result, query: QueryBuilder) {
            const whereIds = result.map(item => item[meta.localKey]) as string[]
            query.whereIn(meta.foreignKey, whereIds)
        },

        async appendResult(field, result, relatedResult): Promise<any> {
            result.forEach(item => {
                const res = relatedResult.find(relatedItem => {
                    return item[meta.localKey] === relatedItem[meta.foreignKey]
                })
                item[field] = repo.$format(res)
            })
        }
    }
}
