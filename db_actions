var express = require('express');
var Guid = require('guid');
var model = require("./model/database_model");
var router = express.Router();

router.post("/add_user", function (req, res) {

    if (!req.body.name || !req.body.surname || !req.body.jmbag || !req.body.record_num || !req.body.record_length) {
        res.status(400).send();
        return;
    }

    var User = model.user;

    var user = new User();
    var id = -1;
    user.find("first", {where: "jmbag = " + req.body.jmbag}, function (err, row, fields) {
        if (!err && row !== undefined) {
            id = row.id;
        }

        user = new User({
            name: req.body.name,
            surname: req.body.surname,
            jmbag: req.body.jmbag,
            role_id: 2, //regular user constant
            last_access_date: new Date().toISOString().slice(0, 19).replace('T', ' ') //set current time
        });

        //update existing user
        if (id !== -1) {
            user.set('id', id);
        }

        var Identifier = model.identifier;
        var guid = Guid.create();
        var identifier = new Identifier({
            identifier: guid,
            number_of_records: req.body.record_num
        });

        user.save(function (err, result) {
            if (err) {
                res.status(500).send(err);
            }

            identifier.save(function (error, r) {
                if (error) {
                    res.status(500).send(error);
                }

                res.json({"identifier_id": r.insertId});
            });

        });
    });
});

router.get("/get_users", function (req, res) {
    var User = model.user;

    var user = new User();
    user.find("all", {}, function (err, rows, fields) {
        res.json(rows);
    })
});

module.exports = router;