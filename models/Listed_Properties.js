const sequelize = require('sequelize');

const db = require('../config/DBConfig');
const Agent = require('./Agent'); // Import the Agent model

const Listed_Properties = db.define('listed_properties', {
    Property_ID:{
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Property_Name:{
        type: sequelize.STRING
    },
    Property_Type:{
        type: sequelize.STRING
    },
    Property_Address:{
        type: sequelize.STRING
    },
    Property_Image:{
        type: sequelize.STRING
    },
    Property_Price: {
        type: sequelize.DECIMAL(20,2)
    },
    Square_Footage:{
        type: sequelize.STRING
    },
    Property_Bedrooms:{
        type: sequelize.INTEGER
    },
    Property_Bathrooms:{
        type: sequelize.INTEGER
    },
    Property_YearBuilt:{
        type: sequelize.INTEGER
    },
    Property_Floor:{
        type: sequelize.INTEGER
    },
    Property_TOP:{
        type: sequelize.STRING
    },
    Property_Tenure:{
        type: sequelize.STRING
    },
    Property_Description:{
        type: sequelize.STRING
    },
    Property_Status:{
        type: sequelize.STRING
    },
    agent_id: {
        type: sequelize.INTEGER,
        references: {
            model: Agent,
            key: 'agent_id'
        }
    },
    Property_Status: {
        type: sequelize.BOOLEAN,
        defaultValue: false  // Assuming the default status is 'not sold'
    },
    Property_ListedDate:{
        type:sequelize.DATE
    }
});

Agent.hasMany(Listed_Properties, { foreignKey: 'agent_id' });
module.exports = Listed_Properties;