import { QueryBuilder } from 'knex'
import { Data } from './repo'

export interface RelationBuilderApi {
    buildQuery: (result: Data[], query: QueryBuilder) => void

    appendResult(field: string, result: Data[], relationResult: Data[]): void
}

export type Relation = (field: string, result: Data[], preload?: string[]) => void

export interface Relations {
    [key: string]: Relation
}

export interface RelationOpts {
    localKey?: string
    foreignKey?: string
    foreignJoin?: string
    localJoin?: string
    joinTable?: string
    query?: (q: QueryBuilder) => void
}

export interface RelationMetadata extends RelationOpts {
    type?: 'has-one' | 'has-many' | 'belongs-to' | 'belongs-to-many'
    as?: string
}
