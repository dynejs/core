import { QueryBuilder } from 'knex'
import { findSiblings, findTop } from './utils'
import { activeConnection } from './connection'
import { Data, Model, PaginatedResult, QueryOptions } from './types/repo'
import { Relation } from './types/relation'

export interface ModelLike {
    id?: string | number
    updated_at?: Date
    created_at?: Date
}

export class Repo<T extends ModelLike = any> {

    model: Model

    constructor(model: Model) {
        this.model = model
    }

    boot(builder) {
        if (!this.model.boot) {
            return
        }
        this.model.boot(builder, this.getConnection())
    }

    getConnection() {
        return activeConnection
    }

    $getTable() {
        return this.model.table
    }

    changeQuery(builder: QueryBuilder, query: QueryOptions<T>) {
        if (query && typeof query === 'object') {
            this.buildWhere(builder, query)
        }
    }

    buildWhere(query, params) {
        if (params && typeof params !== 'object') {
            throw new Error('Query parameters must be an object')
        }
        if (!params) {
            return null
        }
        for (const i in params) {
            query.where(i, params[i])
        }
    }

    getBuilder(): QueryBuilder {
        if (!this.model.table) {
            throw new Error(`Table is not defined`)
        }
        return this.getConnection()(this.model.table)
    }

    getBuilderFromQuery(query: QueryOptions<any>) {
        let builder

        if (query && query.constructor && query.constructor.name === 'Builder') {
            builder = query
        } else if (query && typeof query === 'function') {
            throw new Error('A Builder instance must be passed as query parameter')
        } else {
            builder = this.getBuilder()
            this.changeQuery(builder, query)
        }

        return builder
    }

    async loadRelations(preload: string[], result: Data[]) {
        if (preload) {
            const topRelations = findTop(preload)
            const promises = topRelations.map(relation => {
                const siblingPreload = findSiblings(preload, relation)
                const handler = this.getRelation(relation)
                return handler(relation, result, siblingPreload)
            })
            await Promise.all(promises)
        }
    }

    getRelation(name: string): Relation {
        const rel = this.model.relations()[name]

        if (!rel) {
            throw new Error(`Relation "${name}" not found in ${this.model.name}.`)
        }

        return rel
    }

    $format(result): any {
        if (!result) {
            return null
        }
        if (this.model.format) {
            if (Array.isArray(result)) {
                return result.map(r => {
                    return this.model.format(r)
                })
            }
            return this.model.format(result)
        }
        return result
    }

    $transform(attr) {
        if (this.model.transform) {
            return this.model.transform(attr)
        }
        return attr
    }

    async rawGet(query?: QueryOptions<T>, preload?: string[]): Promise<Data[]> {
        const builder = this.getBuilderFromQuery(query)

        this.boot(builder)

        const result = await builder
        await this.loadRelations(preload, result)
        return result
    }

    async get(query?: QueryOptions<T>, preload?: string[]): Promise<T[]> {
        let result = await this.rawGet(query, preload)
        return result.map(item => this.$format(item))
    }

    async find(query?: QueryOptions<T>, preload?: string[]): Promise<T> {
        const res = await this.get(query, preload)
        return res.shift()
    }

    async create(attr: Partial<T>): Promise<any> {
        const builder = this.getBuilder()

        attr = this.$transform(attr) as any

        delete attr.id

        attr.created_at = new Date()
        attr.updated_at = new Date()

        const ids = await builder.insert(attr)
        attr.id = ids.length > 0 ? ids.shift() : null

        return attr
    }

    async update(query: QueryOptions<T>, attr: Partial<T>): Promise<any> {
        const builder = this.getBuilder()
        this.changeQuery(builder, query)
        attr = this.$transform(attr)
        attr.updated_at = new Date()

        await builder.update(attr)

        return attr
    }

    async save(attr) {
        if (attr.id) {
            return this.update({id: attr.id} as any, attr)
        }
        return this.create(attr)
    }

    async saveMany(attrs) {
        const promises = attrs.map(attr => {
            // A transforming applied here also
            // as id or other attributes may change during transform
            attr = this.$transform(attr)
            if (attr.id) {
                return this.update({id: attr.id} as any, attr)
            }
            return this.create(attr)
        })
        return Promise.all(promises)
    }

    async destroy(query) {
        const builder = this.getBuilder()
        this.changeQuery(builder, query)
        const deleted = await builder.delete()
        return deleted !== 0
    }

    async paginate(size: number, offset: number | string, query?: QueryOptions<T>, preload?: string[]): Promise<PaginatedResult<T>> {
        offset = Number(offset)

        const builder = this.getBuilderFromQuery(query)

        this.boot(builder)

        const paged = await builder.clone()
        builder.limit(size).offset(offset * size)

        const result = await builder

        await this.loadRelations(preload, result)

        return {
            current: offset + 1,
            pages: Math.ceil(paged.length / size),
            total: paged.length,
            data: result.map(item => this.$format(item))
        }
    }

    async sync(props) {
        const builder = this.getBuilder()

        let localKey = null
        let localId = null
        let foreignKey = null
        let foreignIds = null

        Object.keys(props).map(key => {
            if (Array.isArray(props[key])) {
                foreignKey = key
                foreignIds = props[key]
            } else {
                localKey = key
                localId = props[key]
            }
        })

        let existing = await builder.where(localKey, localId) || []
        existing = existing.map((i) => i[foreignKey])

        // Filter record to delete
        const toDelete = existing.filter((i) => {
            return foreignIds.indexOf(i) < 0
        })

        // Filter record to create
        const toCreate = foreignIds.filter((i) => {
            return existing.indexOf(i) < 0
        })

        // Deleting unused
        for (const idToDelete of toDelete) {
            await this.getBuilder()
                .where(localKey, localId)
                .where(foreignKey, idToDelete)
                .delete()
        }

        // Creating new relations
        for (const el of toCreate) {
            await this.getBuilder().insert({
                [localKey]: localId,
                [foreignKey]: el
            })
        }

        return true
    }
}
