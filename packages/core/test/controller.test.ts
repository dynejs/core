class ControllerTest {
    index(req, res) {
        res.send('OK')
    }
}

class BaseProvider {}

// const app = new App([BaseProvider])

// describe('Controller', () => {
//     it('should register a new controller in the container', function () {
//         const controller = app.container.resolve(ControllerTest)
//         assert(controller instanceof ControllerTest)
//     })
//
//     it('controller should response to a get request', async () => {
//         await start(app)
//         const r = await chakram.get('http://localhost:3000')
//         assert(r.response.body === 'OK')
//     })
// })
