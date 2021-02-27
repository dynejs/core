import assert = require('assert')
import {db} from './setup'
import { Post, User, Address, Comment, Category, Photo, CategoryPost } from './repos'

let userId = null

async function createPosts() {

    await db('posts').truncate()
    await db('categories').truncate()
    await db('category_post').truncate()
    await db('comments').truncate()
    await db('users').truncate()
    await db('addresses').truncate()

    userId = await User.create({
        name: 'Test User',
        email: 'john@doe.com'
    })

    await Address.create({
        user_id: userId.id,
        address: 'Middle of Nowhere 211'
    })

    const post1 = await Post.create({
        title: 'First post',
        content: 'First post content',
        author_id: userId.id
    })

    const post2 = await Post.create({
        title: 'Second post',
        content: 'Second post content',
        author_id: userId.id
    })

    await Comment.create({
        comment: 'First comment',
        post_id: post1.id,
        author_id: userId.id
    })

    await Comment.create({
        comment: 'Another comment',
        post_id: post1.id,
        author_id: userId.id
    })

    await Comment.create({
        comment: 'Second comment',
        post_id: post2.id,
        author_id: userId.id
    })

    const category = await Category.create({
        title: 'Category one'
    })

    await CategoryPost.sync({
        post_id: post1.id,
        category_id: [category.id]
    })
}

before(async () => {
    await createPosts()
})

describe('Query', () => {

    it('should set default data', async () => {
        const post = await Post.create({title: 'With default'})
        const p = await Post.find({id: post.id})

        assert(p.title === 'With default')
        await Post.destroy({id: p.id})
    })

    it('should attach relations to parent', async () => {
        const user = await User.create({
            name: 'Billy the Kid'
        })

        const post = await Post.create({
            title: 'Hello post',
            author_id: user.id
        })

        const p = await Post.find({id: post.id}, ['author'])

        assert(p.author.name === 'Billy the Kid')
    })

    it('should change query on model', async () => {
        const res = await Post.get({
            title: 'First post'
        })
        assert(res[0].title === 'First post')
        assert(res.length === 1)
    })

    it('should set default query', async () => {
        const builder = Post.getBuilder()
        builder.orderBy('title', 'desc')
        const res = await Post.get(builder)
        assert(res[0].title === 'Second post')
    })

    it('should update a record', async () => {
        const addr = await Address.find()
        await Address.update({id: addr.id}, {address: 'Changed address'})

        const res = await Address.find({id: addr.id})
        assert(res.address === 'Changed address')
    })

    it('should delete a record', async () => {
        const p = await Post.find()
        await Post.destroy({id: p.id})
        const res = await Post.find({id: p.id})
        assert(!res)
    })

    it('should give paginated result', async () => {
        const builder = Post.getBuilder().orderBy('title', 'desc')
        const res = await Post.paginate(1, 0, builder)

        assert(res.current > 0)
        assert(res.pages > 0)
        assert(res.total > 0)
        assert(res.data.length > 0)
        assert(res.data[0].title !== '')
    })

    it('should order items', async () => {
        await db('photos').truncate()

        const itemId1 = await Photo.create({
            title: 'First',
            order: 0
        })

        const itemId2 = await Photo.create({
            title: 'Second',
            order: 1
        })

        const itemId3 = await Photo.create({
            title: 'Third',
            order: 2
        })

        const items = [itemId3, itemId2, itemId1]

        let ndx = 0
        for (const p of items) {
            await Photo.update({id: p.id}, {order: ndx})
            ndx++
        }

        const builder = Photo.getBuilder().orderBy('order', 'asc')
        const res = await Photo.get(builder)

        assert(res[0].title === 'Third')
        assert(res[0].order === 0)
        assert(res[1].title === 'Second')
        assert(res[1].order === 1)
        assert(res[2].title === 'First')
        assert(res[2].order === 2)
    })
})

describe('Query relations', () => {
    it('should give belongsToMany relations', async () => {
        const res = await Post.find(null, [
            'categories',
            'comments',
            'comments.author',
            'author',
            'author.address'
        ])

        assert(Array.isArray(res.comments))
        assert(res.comments.length > 0)
        assert(res.comments[0].comment !== '')
    })

    it('should give hasOne relations', async () => {
        const res = await User.find(null, ['address'])
        assert(res.address.id !== '')
        assert(res.address.address !== '')
    })

    it('should give has many relations', async () => {
        const res = await Post.find(null, ['comments'])
        assert(res.comments[0].comment !== '')
    })

    it('should give hasOne relations with other table', async () => {
        const res = await User.find(null, ['address'])
        assert(res.address.address !== '')
    })

    it('should test belongsTo relations with other table', async () => {
        const res = await Address.find(null, ['user'])
        assert(res.user.name === 'Test User')
    })

    it('should give belongsTo relations', async () => {
        const res = await Address.find(null, ['user'])
        assert(res.user.name === 'Test User')
    })

    it('should sync relations', async () => {
        const post = await Post.find()

        await Category.create({
            title: 'Category X'
        })

        await Category.create({
            title: 'Category Y'
        })

        const categories = await Category.get()

        await CategoryPost.sync({
            post_id: post.id,
            category_id: [categories[1].id]
        })

        const p2 = await Post.find({id: post.id}, ['categories'])
        assert(p2.categories.length === 1)
    })

    it('should give results with whereExists', async () => {
        await createPosts()

        const builder = Post.getBuilder()
        const db = Post.getConnection()
        const select = db('categories')
            .where('title', 'Category one')
            .leftJoin('category_post', 'category_post.category_id', 'categories.id')
            .whereRaw('category_post.post_id = posts.id')
        builder.whereExists(select)

        const res = await Post.get(builder, ['categories'])

        assert(res.length === 1)
        assert(res[0].title === 'First post')
    })
})
