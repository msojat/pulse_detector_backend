var express = require('express');
var Guid = require('guid');
var model = require("./model/database_model");
var config = require("../config.json");
var router = express.Router();

router.post("/add_user", function (req, res) {

    if (!req.body.name || !req.body.surname || !req.body.jmbag || !req.body.number_of_records ||
        req.body.app_secret !== config.app_secret) {
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
            number_of_records: req.body.number_of_records
        });

        user.save(function (err, result) {
            if (err) {
                res.status(500).send(err);
            }

            if (id === -1) {
                id = result.insertId;
            }

            identifier.save(function (error, r) {
                if (error) {
                    res.status(500).send(error);
                }

                res.json({"identifier_id": r.insertId, "user_id": id});
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

router.post("/add_record", function (req, res) {

    if (!req.body.user_id || !req.body.identifier_id || !req.body.record_length || !req.body.record_number ||
        !req.body.start_record_time || !req.body.end_record_time || !req.body.heart_rate ||
        req.body.app_secret !== config.app_secret) {
        res.status(400).send();
        return;
    }

    var Record = model.record;

    var record = new Record({
        user_id: req.body.user_id,
        record_length: req.body.record_length,
        identifier_id: req.body.identifier_id,
        record_number: req.body.record_number,
        start_record_time: req.body.start_record_time,
        end_record_time: req.body.end_record_time
    });

    record.save(function (err, result) {
        if (err) {
            res.status(500).send(err);
        }

        var HeartRate = model.heartRate;

        var heartRate = new HeartRate({
            heart_rate: req.body.heart_rate,
            identifier_id: req.body.identifier_id,
            record_id: result.insertId
        });

        heartRate.save(function (err, result) {
            if (err) {
                res.status(500).send(err);
            }

            res.status(204).end();

        });
    });
});

module.exports = router;