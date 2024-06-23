const sequelize = require('sequelize');

const db = require('../config/DBConfig');

const Listed_Properties = db.define('listed_properties', {
    Property_ID:{
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Property_Type:{
        type: sequelize.STRING
    },
    Date_Available:{
        type: sequelize.DATE
    },
    Property_Bedrooms:{
        type: sequelize.INTEGER
    },
    Property_Bathrooms:{
        type: sequelize.INTEGER
    },
    Square_Footage:{
        type: sequelize.STRING
    },
    Year_Built:{
        type: sequelize.INTEGER
    },
    Property_Name:{
        type: sequelize.STRING
    },
    Property_Description:{
        type: sequelize.STRING
    },
    Property_Price: {
        type: sequelize.DECIMAL(20,2)
    },
    Property_Address:{
        type: sequelize.STRING
    },
    Property_Image:{
        type: sequelize.STRING
    },
});

module.exports = Listed_Properties;