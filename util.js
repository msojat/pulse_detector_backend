var dateformat = require('dateformat');

var isNameValid = function (name) {
    var nameRegex = new RegExp("[a-zA-Z ]+");
    if (nameRegex.test(name)) {
        return true;
    }

    return false;
};

var isNumberValid = function (number) {
    var numberRegex = new RegExp("\\d+");
    if (numberRegex.test(number)) {
        return true;
    }

    return false;

};

var isMixOfNumbersAndDashes = function (value) {
    var regex = new RegExp("[- \\d:]+");
    if (regex.test(value)) {
        return true;
    }

    return false;
};

var isFloat = function (value) {
    var regex = new RegExp("[+-]?\\d+\\.\\d+");
    if (regex.test(parseFloat(value).toFixed(2))) {
        return true;
    }

    return false;
};

var getFormattedDate = function (date) {
    var format = "dd-mm-yyyy HH:MM:ss";
    return dateformat(date, format);
};

var getForbiddenStatus = function (res) {
    res.writeHead(403, {"Content-Type": "application/json"});
    var json = JSON.stringify({"error": {"code": "403", "description": "Forbidden"}}, null, 4);
    res.end(json);
};

module.exports = {
    isNameValid: isNameValid,
    isNumberValid: isNumberValid,
    isMixOfNumbersAndDashes: isMixOfNumbersAndDashes,
    isFloat: isFloat,
    getFormattedDate: getFormattedDate,
    getForbiddenStatus: getForbiddenStatus
};
