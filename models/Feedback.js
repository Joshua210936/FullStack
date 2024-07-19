const sequelize = require('sequelize');

const db = require('../config/DBConfig');

const Feedback = db.define('feedback', {
    feedback_id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    feedback_type: {
        type : sequelize.STRING
    },
    feedback_name: {
        type: sequelize.STRING
    },
    feedback_email: {
        type: sequelize.STRING
    },
    feedback_date: {
        type: sequelize.DATE
    },
    feedback_rating: {
        type: sequelize.INTEGER
    },
    feedback_description: {
        type: sequelize.STRING
    },
    feedback_status: {
        type: sequelize.STRING
    },
    agent_id: {
        type: sequelize.STRING
    }
});

module.exports = Feedback;