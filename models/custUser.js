const sequelize = require('sequelize');

const db = require('../config/DBConfig');

const Feedback = db.define('customer', {
    customer_id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    customer_fName: {
        type : sequelize.STRING
    },
    customer_lName: {
        type: sequelize.STRING
    },
    customer_phone: {
        type: sequelize.INTEGER
    },
    customer_email: {
        type: sequelize.STRING
    },
    customer_Birthday: {
        type: sequelize.DATE
    },
    customer_Password: {
        type: sequelize.STRING
    },
    customer_cPassword: {
        type: sequelize.STRING
    }
});

module.exports = Customer;