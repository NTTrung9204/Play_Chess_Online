const userDB = require("../models/user");

class loginController {
    // [GET] /login
    index(req, res) {
        res.render("login/login");
    }

    // [POST] /login
    store(req, res) {
        const username = req.body.username;
        const password = req.body.password
        if(username && password) {
            userDB.findOne({username: username, password: password})
                .then((user) => {
                    if(user) {
                        req.session.user_id = user._id;
                        console.log(user.username, "login success!");
                        res.redirect("/");
                    }
                    else {
                        console.log("login failure!: invalid username or password");
                        res.send("invalid username or password");
                    }
                })
        }
        else {
            console.log("login failure!: invalid username or password");
            res.send("invalid username or password");
        }
    }
}

module.exports = new loginController();
