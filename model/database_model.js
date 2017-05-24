var connection = require("../db");

var User = connection.extend({tableName: "user"});
var HeartRate = connection.extend({tableName: "heart_rate"});
var Identifier = connection.extend({tableName: "identifier"});
var Record = connection.extend({tableName: "record"});

module.exports = {
    user: User,
    heartRate: HeartRate,
    identifier: Identifier,
    record: Record
};