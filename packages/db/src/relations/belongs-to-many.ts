import * as Knex from 'knex'
import { RelationBuilderApi, RelationMetadata } from '../types/relation'
import { Repo } from '../repo'

export function belongsToMany(repo: Repo, meta: RelationMetadata): RelationBuilderApi {
    return {
        buildQuery(result, query: Knex.QueryBuilder) {
            const whereIds = result.map(item => item[meta.localKey]) as string[]
            const relatedTable = repo.$getTable()

            query.select(
                `${relatedTable}.*`,
                `${meta.joinTable}.${meta.localJoin}`,
                `${meta.joinTable}.${meta.foreignJoin}`
            )
            query.leftJoin(
                meta.joinTable,
                `${meta.joinTable}.${meta.foreignJoin}`,
                `${relatedTable}.${meta.foreignKey}`
            )
            query.whereIn(`${meta.joinTable}.${meta.localJoin}`, whereIds)
        },

        async appendResult(field, result, relatedResult): Promise<any> {
            result.forEach(item => {
                const res = relatedResult.filter(relatedItem => {
                    return item[meta.localKey] === relatedItem[meta.localJoin]
                })
                item[field] = repo.$format(res)
            })
        }
    }
}
