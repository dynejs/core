import * as fs from 'fs'
import * as sass from 'node-sass'
import * as path from 'path'
import * as marked from 'marked'
import * as hbs from 'hbs'

const root = path.join(__dirname + '/../docs')

const config = require(root + '/config.json')
const files = config.files

const layout = fs.readFileSync(path.join(root + '/layout/index.hbs'), 'utf8')

const nav = Object.keys(files).map(key => {
    return {
        title: key,
        class: '',
        link: files[key].replace('.md', '.html')
    }
})

Object.keys(files).forEach(key => {
    const file = files[key]
    if (fs.statSync(path.join(root, file)).isDirectory()) return

    const content = fs.readFileSync(path.join(root, file), 'utf8')
    const html = marked(content)
    nav.forEach(n => {
        n.class = n.title === key ? 'class="active"' : ''
    })
    const fileContent = hbs.compile(layout)({ content: new hbs.SafeString(html), nav })
    fs.writeFileSync(root + '/build/' + file.replace('.md', '.html'), fileContent)
})

const styles = fs.readFileSync(root + '/styles/styles.scss', 'utf8')
const result = sass.renderSync({
    data: styles.toString()
})

fs.writeFileSync(root + '/build/styles.css', result.css, 'utf8')
