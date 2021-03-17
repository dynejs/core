const fs = require('fs')
const { task } = require('gulp')
const args = require('yargs').argv
const packages = require('./packages')

const version = args.to

async function makeVersions () {
    if (!version) {
        console.error('Version info not provided')
        return
    }
    const files = packages.map(package => {
        return 'packages/' + package + '/package.json'
    })
    for (const f of files) {
        const filePath = process.cwd() + '/' + f
        const ct = require(filePath)
        ct.version = version
        await fs.promises.writeFile(filePath, JSON.stringify(ct, null, 4))
    }
}

task('bump', makeVersions)
