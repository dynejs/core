import { QueryBuilder } from 'knex'
import { findSiblings, findTop } from './utils'
import { activeConnection } from './connection'
import { Data, PaginatedResult, QueryOptions } from './types/repo'
import { Relation } from './types/relation'
import { relation } from './relations/relation'

export abstract class Repo {

    static table: string

    static $boot(builder) {
        if (!this.boot) {
            return
        }
        this.boot(builder, this.getConnection())
    }

    static boot(builder, connection?) {

    }

    static transform(attr) {
        return attr
    }

    static format(attr) {
        return attr
    }

    static relations() {
        return {}
    }

    static getConnection() {
        return activeConnection
    }

    static $getTable() {
        return this.table
    }

    static hasMany(model: typeof Repo, foreignKey: string) {
        return relation(model, {foreignKey, localKey: 'id', type: 'has-many'})
    }

    static hasOne(model: typeof Repo, foreignKey: string) {
        return relation(model, {localKey: 'id', foreignKey, type: 'has-one'})
    }

    static belongsTo(model: typeof Repo, localKey: string) {
        return relation(model, {localKey, foreignKey: 'id', type: 'belongs-to'})
    }

    static belongsToMany(model: typeof Repo, localKey: string, foreignKey: string, joinTable: string) {
        return relation(model, {
            localKey: 'id',
            foreignKey: 'id',
            localJoin: localKey,
            foreignJoin: foreignKey,
            joinTable,
            type: 'belongs-to-many'
        })
    }

    static changeQuery(builder: QueryBuilder, query: QueryOptions<any>) {
        if (query && typeof query === 'object') {
            this.buildWhere(builder, query)
        }
    }

    static buildWhere(query, params) {
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

    static getBuilder(): QueryBuilder {
        if (!this.table) {
            throw new Error(`Table is not defined`)
        }
        return this.getConnection()(this.table)
    }

    static getBuilderFromQuery(query: QueryOptions<any>) {
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

    static async loadRelations(preload: string[], result: Data[]) {
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

    static getRelation(name: string): Relation {
        const rel = this.relations()[name]

        if (!rel) {
            throw new Error(`Relation "${name}" not found in ${this.name}.`)
        }

        return rel
    }

    static $format(result): any {
        if (!result) {
            return null
        }
        if (Array.isArray(result)) {
            return result.map(r => {
                return this.format(r)
            })
        }
        return this.format(result)
    }

    static $transform(attr) {
        return this.transform(attr)
    }

    static async rawGet(query?: QueryOptions<any>, preload?: string[]): Promise<Data[]> {
        const builder = this.getBuilderFromQuery(query)

        this.$boot(builder)

        const result = await builder
        await this.loadRelations(preload, result)
        return result
    }

    static async get(query?: QueryOptions<any>, preload?: string[]): Promise<any[]> {
        let result = await this.rawGet(query, preload)
        return result.map(item => this.$format(item))
    }

    static async find(query?: QueryOptions<any>, preload?: string[]): Promise<any> {
        const res = await this.get(query, preload)
        return res.shift()
    }

    static async create(attr: Partial<any>): Promise<any> {
        const builder = this.getBuilder()

        attr = this.$transform(attr) as any

        delete attr.id

        attr.created_at = new Date()
        attr.updated_at = new Date()

        const ids = await builder.insert(attr)
        attr.id = ids.length > 0 ? ids.shift() : null

        return attr
    }

    static async update(query: QueryOptions<any>, attr: Partial<any>): Promise<any> {
        const builder = this.getBuilder()
        this.changeQuery(builder, query)
        attr = this.$transform(attr)
        attr.updated_at = new Date()

        await builder.update(attr)

        return attr
    }

    static async save(attr) {
        if (attr.id) {
            return this.update({id: attr.id} as any, attr)
        }
        return this.create(attr)
    }

    static async saveMany(attrs) {
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

    static async destroy(query) {
        const builder = this.getBuilder()
        this.changeQuery(builder, query)
        const deleted = await builder.delete()
        return deleted !== 0
    }

    static async paginate(size: number, offset: number | string, query?: QueryOptions<any>, preload?: string[]): Promise<PaginatedResult<any>> {
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

    static async sync(props) {
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
