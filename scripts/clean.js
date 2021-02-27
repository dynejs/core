#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const rimraf = require('rimraf')

const packageDir = path.join(process.cwd(), 'packages')

const dirs = fs.readdirSync(packageDir)

for (let dir of dirs) {
    const distDir = path.join(packageDir, dir, 'dist')
    const moduleDir = path.join(packageDir, dir, 'node_modules')
    if (fs.existsSync(distDir)) {
        rimraf.sync(distDir)
    }
    if (fs.existsSync(moduleDir)) {
        rimraf.sync(moduleDir)
    }
}

console.log('Done')
process.exit(0)
