const testRouter = require('./testRouter');
const registerRouter = require('./registerRouter');
const loginRouter = require('./loginRouter');
const normalMatchRouter = require('./normalMatchRouter');

function routes(app) {
    app.use('/normalMatch', normalMatchRouter);
    app.use('/register', registerRouter);
    app.use('/login', loginRouter);
    app.use('/', testRouter);
}

module.exports = routes;