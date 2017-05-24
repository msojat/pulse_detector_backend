var express = require("express");
var bodyParser = require('body-parser');
var dbActions = require('./db_actions');
var app = express();

//body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use("/api", dbActions);

app.listen(3000);