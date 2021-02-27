import { belongsTo } from './belongs-to'
import { belongsToMany } from './belongs-to-many'
import { hasOne } from './has-one'
import { hasMany } from './has-many'
import { Data } from '../types/repo'
import { RelationBuilderApi, RelationMetadata } from '../types/relation'
import { Repo } from '../repo'

const builders = {
    'has-one': hasOne,
    'has-many': hasMany,
    'belongs-to': belongsTo,
    'belongs-to-many': belongsToMany
}

export function relation(model: Repo, meta: RelationMetadata) {
    const relationBuilder: RelationBuilderApi = builders[meta.type](model, meta)

    return async function build(field: string, result: Data[], preload?: string[]) {
        const builder = model.getBuilder()

        relationBuilder.buildQuery(result, builder)

        const relationResult = await model.rawGet(builder, preload)
        relationBuilder.appendResult(field, result, relationResult)
    }
}
