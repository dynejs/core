# Dyne Image

On the fly thumbnail generator utility and middleware function built on sharp module. 

Usage:

```ts
const { Image } = require('@dynejs/image')

const image = new Image({
    sizes: {
        large: {
            width: 700,
            height: 500
        },
        small: {
            width: 120,
            height: 120
        }
    },
    baseDir: 'storage/public',
    url: '/storage/:size/:name'
})

app.use(image.middleware())
```
- **sizes**: image size definitions, see above
- **baseDir**: where your original images located
- **url**: request path for the middleware. `size` and `name` should be presented.

### Thumbnail generation
When a request has been made, the middleware will listen for the defined path. 
The generator will be initialized and looking for an original image with that name.
It will resize the original image with the defined and found dimensions and saves
into a folder named by the size key. At the same time, it will send back the resized file
to the client.

These requests will always initialize the generator. To catch and serve existing images, 
place your static middleware before the generator:

```
// Static files
app.use('/storage', app.static(app.basePath('storage/public')))

// Generator middleware
app.use(image.middleware())  
```

If an image not found, the request will be piped into next middleware, in this case
into our generator middleware.
If the original image not exists `next()` gets called.
