const sequelize = require('sequelize');

const db = require('../config/DBConfig');

const Customer = db.define('customer', {
    Customer_id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Customer_fName: {
        type : sequelize.STRING
    },
    Customer_lName: {
        type: sequelize.STRING
    },
    Customer_Phone: {
        type: sequelize.INTEGER
    },
    Customer_Email: {
        type: sequelize.STRING,
        unique: true
    },
    Customer_Password: {
        type: sequelize.STRING
    },
    Customer_OTP: {
        type: sequelize.STRING
    },
    OTP_Expiration: {
        type: sequelize.DATE
    }
});

module.exports = Customer;