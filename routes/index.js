var express = require("express");
var model = require("./../model/database_model");
var router = express.Router();

const notFound = "not_found";
const getRecordsUrl = "/get_records/";
const userDetails = "/user_details/";

router.get("/", function (req, res) {

    if (req.param(notFound)) {
        res.render("home", {"jmbag": req.param(notFound), "url": userDetails});

    } else {
        res.render("home", {"url": userDetails});

    }
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
            return;
        }

        if (row === undefined) {
            res.redirect("/?" + notFound + "=" + req.param('jmbag'));
            return;
        }

        var user = {
            'id': row.id,
            'name': row.name,
            'surname': row.surname,
            'jmbag': row.jmbag,
            'active_since': row.active_since,
            'last_access_date': row.last_access_date
        };

        res.render("user_details", {"user": user, "url": getRecordsUrl + row.jmbag});
    });
});

router.get("/get_records/:jmbag", function (req, res) {
    var jmbag = req.param('jmbag');

    res.render("all_records", {"jmbag": jmbag});
});

module.exports = router;