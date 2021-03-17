import * as Knex from 'knex'
import { QueryBuilder as KnexQueryBuilder } from 'knex'

export type Data = Record<string, unknown>

export type QueryModifier = (query: Knex.QueryBuilder, db?: Knex) => void

export type QueryConditions<T> = Partial<T>

export interface QueryBuilder extends KnexQueryBuilder {

}

export interface PaginatedResult<T> {
    current: number
    pages: number
    total: number
    data: T[]
}

export type QueryOptions<T> = QueryBuilder | QueryConditions<T>
