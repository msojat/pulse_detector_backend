let express = require("express");
let model = require("./../model/database_model");
let util = require("../util");
let router = express.Router();

const notFound = "not_found";
const isEmpty = "is_empty";
const getRecordsUrl = "/sessions/";
const userDetails = "/user_details/";
const recordDetails = "/session_details/";

let userNotFound = function (req, res) {
    res.redirect("/?" + notFound + "=" + req.params['jmbag']);
};

router.get("/", function (req, res) {

    if (req.params[notFound]) {
        res.render("home", {layout: false, "jmbag": req.params[notFound], "url": userDetails});
    } else {
        res.render("home", {layout: false, "url": userDetails});
    }
});

router.get("/user_details/:jmbag", function (req, res) {

    if (!req.params['jmbag'] || req.params['jmbag'].length !== 10) {
        userNotFound(req, res);
        return;
    }

    const User = model.user;
    let user = new User();

    user.find('first', {where: "jmbag = " + req.params['jmbag']}, function (err, row) {

        if (err) {
            util.getInternalServerError(res);
            return;
        }

        if (row === undefined) {
            userNotFound(req, res);
            return;
        }

        let user = {
            'id': row.id,
            'name': row.name,
            'surname': row.surname,
            'jmbag': row.jmbag,
            'active_since': util.getFormattedDate(row.active_since),
            'last_access': util.getFormattedDate(row.last_access_date)
        };

        if (req.params[isEmpty]) {
            res.render("user_details", {
                "layout": false,
                "user": user,
                "url": getRecordsUrl + row.jmbag,
                "is_empty": req.params[isEmpty]
            });
        } else {
            res.render("user_details", {"layout": false, "user": user, "url": getRecordsUrl + row.jmbag});
        }
    });
});

router.get("/sessions/:jmbag", function (req, res) {
    let jmbag = req.params['jmbag'];

    const query = 'SELECT `user`.name, `user`.surname, `user`.jmbag,' +
        ' measurement_session.id, measurement_session.start_time, measurement_session.session_name' +
        ' FROM measurement_session ' +
        ' LEFT JOIN `user` ON measurement_session.user_id = `user`.id ' +
        ' HAVING `user`.jmbag = "' + jmbag + '";';

    const User = model.user;

    let user = new User();

    user.query(query, function (error, r) {
        if (error) {
            util.getInternalServerError(res);
            return;
        }

        if (r === undefined) {
            userNotFound(req, res);
            return;
        }

        if (r.length === 0) {
            res.redirect(userDetails + jmbag + "?" + isEmpty + "=" + true);
            return;
        }

        let fullName = r[0].name + " " + r[0].surname;

        let url = userDetails + jmbag;

        let data = [];
        for (let i = 0; i < r.length; i++) {
            let tmp = {};
            tmp.index_increment = i + 1;
            tmp.start_time = r[i].start_time;
            tmp.session_name = r[i].session_name;
            tmp.url = "/api/csv?session_id=" + r[i].id;
            data.push(tmp);
        }

        res.render("all_sessions", {"layout": false, "data": data, "fullname": fullName, "jmbag": jmbag, "url": url});

    });
});

router.get("/session_details/:jmbag/:identifier_id/:session_number", function (req, res) {
    var identifierId = req.params['identifier_id'];
    var jmbag = req.params['jmbag'];
    var sessionNumber = req.params['session_number'];

    var query = 'select distinct record.id, record.identifier_id, record.record_number, identifier.number_of_records,' +
        ' record.record_length, record.start_record_time, record.end_record_time, heart_rate.heart_rate, user.name,' +
        ' user.surname from record ' +
        ' join heart_rate on heart_rate.identifier_id = record.identifier_id' +
        ' join identifier on record.identifier_id = identifier.id ' +
        ' join user on user.id = record.user_id' +
        ' where record.identifier_id = ' + identifierId + ' and heart_rate.identifier_id = ' + identifierId + '' +
        ' and heart_rate.record_id = record.id and user.jmbag = ' + jmbag + ';';

    var Record = model.record;

    var record = new Record();

    record.query(query, function (error, results, fields) {
        if (error) {
            util.getInternalServerError(res);
            return;
        }

        if (results === undefined || results.length === 0) {
            userNotFound(req, res);
            return;
        }

        var url = getRecordsUrl + jmbag;
        var detailsUrl = userDetails + jmbag;
        var session = {};

        if (results.length > 0) {
            session.number_of_records = results[0].number_of_records;
            session.completed_records = results.length;
            session.is_completed = results[0].number_of_records === results.length;
        }

        var data = [];

        var fullname = results[0].name + " " + results[0].surname;

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
                "layout": false,
                "data": data,
                "url": url,
                "session": session,
                "fullname": fullname,
                "details_url": detailsUrl,
                "session_number": sessionNumber
            });
        } else {
            res.render("session_details", {
                "layout": false,
                "data": data, "fullname": fullname, "details_url": detailsUrl
            });
        }

    });

});

module.exports = router;