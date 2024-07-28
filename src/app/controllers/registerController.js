const user = require("../models/user");

class registerController {
    // [GET] /register
    index(req, res) {
        res.render("register/register");
    }

    // [POST] /register
    store(req, res) {
        user.create(req.body)
            .then(() => {
                res.redirect("/login");
            })
            .catch((error) => {
                console.log("register failure!");
                console.log(req.body);
                console.log(error);
            });
    }
}

module.exports = new registerController();
