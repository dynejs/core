import { Repo } from '../src'

export class User extends Repo {
    static table = 'users'

    static relations() {
        return {
            address: this.hasOne(Address, 'user_id')
        }
    }
}

export class Category extends Repo {
    static table = 'categories'

    static relations() {
        return {
            photo: this.hasOne(Photo, 'category_id')
        }
    }
}

export class Comment extends Repo {
    static table = 'comments'

    static relations() {
        return {
            author: this.belongsTo(User, 'author_id')
        }
    }
}

export class CategoryPost extends Repo {
    static table = 'category_post'
}

export class Photo extends Repo {
    static table = 'photos'
}

export class Address extends Repo {
    static table = 'addresses'

    static relations() {
        return {
            user: this.belongsTo(User, 'user_id')
        }
    }
}

export class Post extends Repo {
    static table = 'posts'

    static relations() {
        return {
            author: this.belongsTo(User, 'author_id'),
            comments: this.hasMany(Comment, 'post_id'),
            categories: this.belongsToMany(Category, 'post_id', 'category_id', 'category_post')
        }
    }
}
