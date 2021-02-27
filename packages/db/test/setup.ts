import { Connection } from '../src'

const connection = new Connection({
    filename: './test.db',
    client: 'sqlite3'
})

export const db = connection.active()
