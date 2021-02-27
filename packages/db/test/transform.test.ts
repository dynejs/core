import { findSiblings, findTop } from '../src/utils'

describe('Preloading list', () => {
    it('should transform preload list and split into chunks', function () {
        const obj = [
            'comments.author',
            {'comments': true},
            {'comments.author.address': true},
            'comments.author.photo',
            'else',
            {'else.other': true}
        ]

        const top = findTop(obj)

        console.log(top)

        const siblings = findSiblings(obj, 'comments')

        console.log(siblings)
    })
})
