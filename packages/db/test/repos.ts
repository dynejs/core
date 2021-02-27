import { belongsTo, belongsToMany, hasMany, hasOne, Repo } from '../src'

export interface IUser {
    name: string
    email: string
}

export const User = new Repo({
    table: 'users',

    relations() {
        return {
            address: hasOne(Address, 'user_id')
        }
    }
})

export const Category = new Repo({
    table: 'categories',

    relations() {
        return {
            photo: hasOne(Photo, 'category_id')
        }
    }
})

export const Comment = new Repo({
    table: 'comments',

    relations() {
        return {
            author: belongsTo(User, 'author_id')
        }
    }
})

export const CategoryPost = new Repo({
    table: 'category_post',
})

export const Photo = new Repo({
    table: 'photos',
})

export const Address = new Repo({
    table: 'addresses',

    relations() {
        return {
            user: belongsTo(User, 'user_id')
        }
    }
})

export interface IPost {
    id: number
    title: string
    metadata: string
    published: boolean
    content: string
    author: IUser
    author_id: number | string
    comments: any[]
    categories: any[]
}

export const Post = new Repo<IPost>({
    table: 'posts',

    relations() {
        return {
            author: belongsTo(User, 'author_id'),
            comments: hasMany(Comment, 'post_id'),
            categories: belongsToMany(Category, 'post_id', 'category_id', 'category_post')
        }
    }
})
