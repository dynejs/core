const { task, series, src, dest } = require('gulp')
const { createProject } = require('gulp-typescript')
const packages = require('./packages')
const yargs = require('yargs')

const only = yargs.argv.only

function buildPackage (package) {
    const project = createProject('packages/' + package + '/tsconfig.json')
    return project
        .src()
        .pipe(project())
        .pipe(dest('packages/' + package + '/dist'))
}

packages.forEach(package => {
    if (only) {
        if (package === only) {
            task(package, () => buildPackage(package))
        }
    } else {
        task(package, () => buildPackage(package))
    }
})

task('build', series(only || packages))
