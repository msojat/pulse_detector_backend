var express = require("express");
var Guid = require("guid");
var model = require("./../model/database_model");
var config = require("../config.js");
var router = express.Router();
var util = require("../util");

router.post("/add_user", function (req, res) {

    if (req.body.app_secret !== config.app_secret) {
        util.getForbiddenStatus(res);
        return;
    }

    if (!(util.isNumberValid(req.body.jmbag) && req.body.jmbag.length == 10 &&
        util.isNumberValid(req.body.number_of_records) &&
        util.isNameValid(req.body.name) && util.isNameValid(req.body.surname))) {
        res.status(400).send();
        return;
    }

    const User = model.user;

    let user = new User();
    let id = -1;
    user.find("first", {where: "jmbag = " + req.body.jmbag}, function (err, row, fields) {
		
        if (err) {
            util.getInternalServerError(res);
            return;
        }

        if (!err && row !== undefined) {
            id = row.id;
        }

        user = new User({
            name: req.body.name,
            surname: req.body.surname,
            jmbag: req.body.jmbag,
            last_access_date: new Date()
        });

        //update existing user
        if (id !== -1) {
            user.set('id', id);
        } else {
            user.active_since = new Date();
        }
		
        user.save(function (err, result) {
            if (err) {
                util.getInternalServerError(res);
                return;
            }

            if (id === -1) {
                id = result.insertId;
            }
            res.json({"user_id": id});
        });
    });
});

router.post("/session", function (req, res) {

    if (req.body.app_secret !== config.app_secret) {
        util.getForbiddenStatus(res);
        return;
    }

    let user_id = req.body.user_id;
    let start_time = null;
    if (req.body.start_time) {
        start_time = req.body.start_time;
    }

    const User = model.user;
    let user = new User();
    user.set("id", user_id);
    user.find("first", {where: "id = " + user.id}, function (err, row) {

        if (err) {
            util.getInternalServerError(res);
            return;
        }

        if (!err && row === undefined) {
            res.status(400).send();
        }

        const MeasurementSession = model.measurementSession;
        let measurementSession = new MeasurementSession({
            user_id: user.id,
            start_time: start_time
        });


        measurementSession.save(function (error, r) {
            if (error) {
                util.getInternalServerError(res);
                return;
            }
            res.json({"measurement_session_id": r.insertId});
        });
    });
});

router.get("/get_users", function (req, res) {

    if (req.header("app_secret") !== config.app_secret) {
        util.getForbiddenStatus(res);
        return;
    }

    const User = model.user;

    let user = new User();
    user.find("all", {}, function (err, rows, fields) {

        if (err) {
            util.getInternalServerError(res);
            return;
        }

        res.json(rows);
    })
});

router.post("/add_record", function (req, res) {
    if (req.body.app_secret !== config.app_secret) {
        util.getForbiddenStatus(res);
        return;
    }

    if (!(util.isNumberValid(req.body.user_id) && util.isNumberValid(req.body.identifier_id) &&
        util.isNumberValid(req.body.record_length) && util.isNumberValid(req.body.record_number) &&
        util.isMixOfNumbersAndDashes(req.body.start_record_time) &&
        util.isMixOfNumbersAndDashes(req.body.end_record_time) && util.isFloat(req.body.heart_rate))) {
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
            util.getInternalServerError(res);
            return;
        }

        var HeartRate = model.heartRate;

        var heartRate = new HeartRate({
            heart_rate: req.body.heart_rate,
            identifier_id: req.body.identifier_id,
            record_id: result.insertId
        });

        heartRate.save(function (err, result) {
            if (err) {
                util.getInternalServerError(res);
                return;
            }

            res.status(204).end();

        });
    });
});

router.post("/add_record/bulk", function (req, res) {
    // Return forbidden if app_secret is missing
    if (req.body.app_secret !== config.app_secret) {
        util.getForbiddenStatus(res);
        return;
    }

    let records = req.body.records;
    const session_id = req.body.measurement_session_id;

    if(!Array.isArray(records)) {
        util.getBadRequest(res);
        return;
    }

    records.forEach(function (record, index) {
        let value = record.value;
        let time = record.time;
        let image_id = record.image;

        const Measurement = model.measurement;
        let measurement = new Measurement({
            bpm: value,
            time: time,
            image_id: image_id,
            session_id: session_id
        });

        measurement.save(function(err, row){
            if (err) {
                util.getInternalServerError(res);
                res.end()
            }
            if(index === records.length - 1){
                res.end();
            }
        });
    });
});

router.post("/add_image", function (req, res) {
    if (req.body.app_secret !== config.app_secret) {
        util.getForbiddenStatus(res);
        return;
    }

    const Image = model.image;
    let image = new Image();

    if(! req.body.name){
        res.status(400).end();
        return;
    }

    image.find("first", {where: "name = '" + req.body.name + "'"}, function (err, row) {
        if (err) {
            util.getInternalServerError(res);
            return;
        } else {
            if (row === undefined){
                image.set('name', req.body.name);
                if(req.body.location){
                    image.set('location', req.body.location);
                }
                image.save(function (err, result) {
                    if (err) {
                        util.getInternalServerError(res);
                        return;
                    } else {
                        image.set('id', result.insertId);
                        res.status(200).send(image);
                    }
                });
            } else {
                res.status(200).send(row);
            }
        }
    });
});


module.exports = router;