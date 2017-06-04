var express = require('express');
var model = require("./../model/database_model");
var router = express.Router();

router.get("/", function (req, res) {
    res.render("home", {data: "home.hbs"});
});

router.get("/user_details/:jmbag", function (req, res) {

    if (!req.param('jmbag') || req.param('jmbag').length !== 10) {
        res.status(400).json({"status_code": 400, "status_message": "Check your JMBAG"});
        return;
    }

    var User = model.user;

    var user = new User();

    user.find('first', {where: "jmbag = " + req.param('jmbag')}, function (err, row, fields) {

        if (err) {
            res.status(500).json({"status_code": 500, "status_message": "internal server error"});
        }

        var user = {
            'id': row.id,
            'name': row.name,
            'surname': row.surname,
            'jmbag': row.jmbag,
            'active_since': row.active_since,
            'last_access_date': row.last_access_date
        };

        res.render("user_details", {"user": user});
    });
});

module.exports = router;