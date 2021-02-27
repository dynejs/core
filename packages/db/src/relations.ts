import { relation } from './relations/relation'
import { Repo } from './repo'

export function hasMany(model: Repo, foreignKey: string) {
    return relation(model, {foreignKey, localKey: 'id', type: 'has-many'})
}

export function hasOne(model: Repo, foreignKey: string) {
    return relation(model, {localKey: 'id', foreignKey, type: 'has-one'})
}

export function belongsTo(model: Repo, localKey: string) {
    return relation(model, {localKey, foreignKey: 'id', type: 'belongs-to'})
}

export function belongsToMany(model: Repo, localKey: string, foreignKey: string, joinTable: string) {
    return relation(model, {
        localKey: 'id',
        foreignKey: 'id',
        localJoin: localKey,
        foreignJoin: foreignKey,
        joinTable,
        type: 'belongs-to-many'
    })
}
