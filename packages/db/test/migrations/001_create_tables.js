'use strict'

async function up(db) {
    await db.schema.createTable('posts', function(table) {
        table.increments('id')
        table.string('title')
        table.string('metadata')
        table.boolean('published').default(false)
        table.text('content')
        table.integer('author_id').index()
        table.timestamps()
    })

    await db.schema.createTable('users', function(table) {
        table.increments('id')
        table.string('name')
        table.string('email')
        table.timestamps()
    })

    await db.schema.createTable('addresses', function(table) {
        table.increments('id')
        table.integer('user_id').index()
        table.text('address')
        table.timestamps()
    })

    await db.schema.createTable('categories', function(table) {
        table.increments('id')
        table.string('title')
        table.timestamps()
    })

    await db.schema.createTable('category_post', function(table) {
        table.integer('category_id').index()
        table.integer('post_id').index()
        table.timestamps()
    })

    await db.schema.createTable('photos', function(table) {
        table.increments('id')
        table.string('title').index()
        table.integer('order').default(0)
        table.string('related_id').index()
        table.string('related_type').index()
        table.timestamps()
    })

    await db.schema.createTable('comments', function(table) {
        table.increments('id')
        table.integer('post_id').index()
        table.integer('author_id').index()
        table.string('comment')
        table.timestamps()
    })
}

async function down(db) {
    db.schema.dropTable('posts')
    db.schema.dropTable('users')
    db.schema.dropTable('addresses')
    db.schema.dropTable('categories')
    db.schema.dropTable('categories_posts')
    db.schema.dropTable('items')
    db.schema.dropTable('comments')
}

module.exports = {
    up,
    down
}
