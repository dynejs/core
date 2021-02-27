import * as assert from 'assert'
import * as hbs from 'hbs'
import { Views } from '../src'

describe('View', () => {
    it('should register a view dir', function () {
        const views = new Views()
        views.add(__dirname + '/views')
        assert(views.views[0])
        assert(hbs.handlebars.partials.partial === 'Partial HTML\r\n')
    })

    it('should register a view helper', function () {
        const views = new Views()
        views.helper('helperFn', () => {
            return () => {}
        })

        assert(typeof hbs.handlebars.helpers.helperFn === 'function')
    })

    it('should render a view', function () {
        const views = new Views()
        views.add(__dirname + '/views')
        const content = views.render('test', {world: 'WORLD'})
        assert(content.startsWith('Hello WORLD'))
    })
})
