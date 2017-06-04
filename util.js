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

module.exports = {
    isNameValid: isNameValid,
    isNumberValid: isNumberValid,
    isMixOfNumbersAndDashes: isMixOfNumbersAndDashes,
    isFloat: isFloat
};
