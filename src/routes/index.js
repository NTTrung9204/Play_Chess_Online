const testRouter = require('./testRouter');

function routes(app) {

    app.use('/', testRouter);
}

module.exports = routes;