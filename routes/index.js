var express = require("express");
var model = require("./../model/database_model");
var util = require("../util");
var router = express.Router();

const notFound = "not_found";
const isEmpty = "is_empty";
const getRecordsUrl = "/get_records/";
const userDetails = "/user_details/";
const recordDetails = "/session_details/";

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
            'active_since': util.getFormattedDate(row.active_since),
            'last_access_date': row.last_access_date
        };

        if (req.param(isEmpty)) {
            res.render("user_details", {
                "user": user,
                "url": getRecordsUrl + row.jmbag,
                "is_empty": req.param(isEmpty)
            });
        } else {
            res.render("user_details", {"user": user, "url": getRecordsUrl + row.jmbag});
        }
    });
});

router.get("/get_records/:jmbag", function (req, res) {
    var jmbag = req.param('jmbag');

    var query = 'select `user`.jmbag, `user`.name, `user`.surname, record.identifier_id, avg(heart_rate.heart_rate) as avg from `user` \ ' +
        'join record on record.user_id = `user`.id \
        join identifier on identifier.id = record.identifier_id \
        join heart_rate on heart_rate.identifier_id = record.identifier_id \
        group by identifier.id,`user`.id \
        having `user`.jmbag = "' + jmbag + '";';

    var User = model.user;

    var user = new User();

    user.query(query, function (error, r, f) {

        if (error) {
            res.status(500).json({"status_code": 500, "status_message": "internal server error"});
            return;
        }

        if (r.length == 0) {
            res.redirect(userDetails + jmbag + "?" + isEmpty + "=" + true);
            return;
        }

        var fullname = r[0].name + " " + r[0].surname;

        var url = userDetails + jmbag;

        var data = [];
        for (var i = 0; i < r.length; i++) {
            var tmp = {};
            tmp.jmbag = r[i].jmbag;
            tmp.avg = r[i].avg.toFixed(2);
            tmp.index_increment = i + 1;
            tmp.url = recordDetails + jmbag + "/" + r[i].identifier_id;
            data.push(tmp);
        }

        res.render("all_records", {"data": data, "fullname": fullname, "jmbag": jmbag, "url": url});

    });
});

router.get("/session_details/:jmbag/:identifier_id", function (req, res) {
    var identifierId = req.param('identifier_id');

    var query = 'select distinct record.id, record.identifier_id, record.record_number, identifier.number_of_records,' +
        ' record.record_length, record.start_record_time, record.end_record_time, heart_rate.heart_rate from record ' +
        ' join heart_rate on heart_rate.identifier_id = record.identifier_id' +
        ' join identifier on record.identifier_id = identifier.id ' +
        ' where record.identifier_id = ' + identifierId + ' and heart_rate.identifier_id = ' + identifierId + '' +
        ' and heart_rate.record_id = record.id;';

    var Record = model.record;

    var record = new Record();

    record.query(query, function (error, results, fields) {
        if (error) {
            res.status(500).json({"status_code": 500, "status_message": "internal server error"});
            return;
        }

        var url = getRecordsUrl + req.param('jmbag');
        var session = {};

        if (results.length > 0) {
            session.number_of_records = results[0].number_of_records;
            session.completed_records = results.length;
            session.is_completed = results[0].number_of_records === results.length;
        }

        var data = [];

        for (var i = 0; i < results.length; i++) {
            var tmp = {};
            tmp.record_number = results[i].record_number;
            tmp.start_record_time = util.getFormattedDate(results[i].start_record_time);
            tmp.end_record_time = util.getFormattedDate(results[i].end_record_time);
            tmp.heart_rate = results[i].heart_rate.toFixed(2);
            tmp.number_of_records = results[i].number_of_records;
            tmp.length = results[i].record_length;
            data.push(tmp);
        }

        if (results.length > 0) {
            res.render("session_details", {
                "data": data,
                "url": url,
                "session": session
            });
        } else {
            res.render("session_details", {"data": data});
        }

    });

});

module.exports = router;