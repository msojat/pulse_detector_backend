var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan-body");
var hbs = require("express-handlebars");
var path = require("path");
var httpErrorPages = require('http-error-pages');
var helmet = require("helmet");

var dbActions = require("./routes/database_actions");
var index = require('./routes/index');

var app = express();

app.use(helmet());

// view engine setup
app.engine('hbs', hbs({extname: 'hbs'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//middleware for serving static files
app.use('/static', express.static('public'));

//body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

logger(app);

app.use("/", index);
app.use("/api", dbActions);

httpErrorPages(app);

app.listen(3000);