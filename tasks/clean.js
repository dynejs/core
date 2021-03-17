const { task, src } = require('gulp')
const clean = require('gulp-clean')
const packages = require('./packages')

function cleanFolders () {
    const dirs = packages.map(package => {
        return 'packages/' + package + '/dist'
    })
    return src(dirs, { read: false, allowEmpty: true })
        .pipe(clean({force: true}))
}

task('clean', cleanFolders)
