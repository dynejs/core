const path = require('path')
const { task } = require('gulp')
const {execSync} = require('child_process')

const linkedPackages = ['db', 'image', 'mail']

async function makeLink () {
    const paths = linkedPackages.map(package => {
        return path.join(process.cwd(), 'packages', package)
    })
    for (const p of paths) {
        const res = execSync('npm link ..' + path.sep + 'core', {cwd: p})
        console.log(res.toString())
    }
    return true
}

task('link', makeLink)
