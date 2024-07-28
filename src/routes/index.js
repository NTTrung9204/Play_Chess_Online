const testRouter = require('./testRouter');
const registerRouter = require('./registerRouter');
const loginRouter = require('./loginRouter');

function routes(app) {
    app.use('/login', loginRouter);
    app.use('/register', registerRouter);
    app.use('/', testRouter);
}

module.exports = routes;