const sequelize = require('sequelize');

const db = require('../config/DBConfig');

const Schedule = db.define('schedule', {
    schedule_id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    customer_id: {
        type : sequelize.INTEGER
    },
    agent_id: {
        type: sequelize.INTEGER,
    },
    property_id: { 
        type: sequelize.INTEGER 
    },
    date_selected: {
        type: sequelize.DATE
    },
    time_selected: {
        type: sequelize.TIME
    }
});

module.exports = Schedule;