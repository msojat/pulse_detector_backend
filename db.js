var mysqlModel = require("mysql-model");

var connection = mysqlModel.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pulse_detector'
});

module.exports = connection;