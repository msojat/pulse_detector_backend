let connection = require("../db");

let User = connection.extend({tableName: "user"});
let Image = connection.extend({tableName: "image"});
let Measurement = connection.extend({tableName: "measurement"});
let MeasurementSession = connection.extend({tableName: "measurement_session"});

module.exports = {
    user: User,
    image: Image,
    measurement: Measurement,
    measurementSession: MeasurementSession
};