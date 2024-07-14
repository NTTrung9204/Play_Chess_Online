class testController {
    index(req, res) {
        res.render('test/test')
    }
}

module.exports = new testController 