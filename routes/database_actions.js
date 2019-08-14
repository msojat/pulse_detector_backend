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

    if (!(util.isNumberValid(req.body.jmbag) && req.body.jmbag.length == 10 && util.isNumberValid(req.body.number_of_records) &&
        util.isNameValid(req.body.name) && util.isNameValid(req.body.surname))) {
        res.status(400).send();
        return;
    }
	
    var User = model.user;
	
    var user = new User();
    var id = -1;
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
		/*
        var Identifier = model.identifier;
        var guid = Guid.create();
        var identifier = new Identifier({
            identifier: guid,
            number_of_records: req.body.number_of_records
        });
		 */
		
        user.save(function (err, result) {
            if (err) {
                util.getInternalServerError(res);
                return;
            }

            if (id === -1) {
                id = result.insertId;
            }
            /*
            identifier.save(function (error, r) {
                if (error) {
                    util.getInternalServerError(res);
                    return;
                }

                res.json({"identifier_id": r.insertId, "user_id": id});
            });
             */
            res.json({"user_id": id});

        });
    });
});

router.get("/get_users", function (req, res) {

    if (req.header("app_secret") !== config.app_secret) {
        util.getForbiddenStatus(res);
        return;
    }

    var User = model.user;

    var user = new User();
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

function saveMeasurement(val, time, image_id, user_id, res, index, len) {
    var Measurement = model.measurement;
    var measurement = new Measurement({
        bpm: val,
        time: time,
        image_id: image_id,
        user_id: user_id
    });

    measurement.save(function(err, row){
        if (err) {
            util.getInternalServerError(res);
            res.end()
        }

        if (index === len - 1) {
            res.status(204).end();
        }
    });
}

router.post("/add_record/bulk", function (req, res) {
    // Return forbidden if app_secret is missing
    if (req.body.app_secret !== config.app_secret) {
        util.getForbiddenStatus(res);
        return;
    }

    let records = req.body.records;
    const user_id = req.body.user_id;
    const Image = model.image;

    if(!Array.isArray(records)) {
        util.getBadRequest(res);
        return;
    }
    let image = new Image();

    records.forEach(function (record, index) {
        var value = record.value;
        var time = record.time;
        var image_name = record.image;

        // var image = new Image();
        image.find("first", {where: "name = '" + record.image + "'"}, function (err, row, fields) {
            if (err) {
                util.getInternalServerError(res);
                res.end()
            }

            // If such entry doesn't exist, insert it
            if (row === undefined) {
                image.set('name', record.image);
                    image.save(function(err, row){
                    if (err) {
                        util.getInternalServerError(res);
                        res.end()
                    }
                    else {
                        image.set('id', row.insertId);
                        saveMeasurement(value, time, image.id, user_id, res, index, records.length);
                    }
                });
            }
            else {
                console.log(row);
                image.set('id', row.id);
                saveMeasurement(value, time, image.id, user_id, res, index, records.length);
            }

            // CONTINUE //

        });
    });
});


module.exports = router;