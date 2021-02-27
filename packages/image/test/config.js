module.exports = {
    image: {
        baseDir: __dirname + '/images',
        url: '/storage/:size/:name',
        sizes: {
            large: {
                width: 600,
                height: 600
            }
        }
    }
}