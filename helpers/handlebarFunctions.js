const moment = require('moment');

module.exports = {
    ifEquals: function(arg1, arg2, options) {
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    },
    concat: function(value1, value2) {
        return value1 + value2;
    },
    formatDate: function(date, targetFormat){
        return moment(date).utc(true).format(targetFormat)
    }
};