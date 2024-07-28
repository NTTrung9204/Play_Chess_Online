const userDB = require("../models/user");
const getRecord = require("../utils/getRecord");

class homePageController {
    // [GET] /test
    index(req, res) {
        userDB.findById(req.session.user_id).then((user) => {
            if (user) {
                user = getRecord.getOneRecord(user);
                res.render("homePage/homePage", { user });
            } else {
                res.redirect("/login");
            }
        });
    }
}

module.exports = new homePageController();
