const sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Agent = require('./Agent'); // Import the Agent model

const Feedback = db.define('feedback', {
    feedback_id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    feedback_type: {
        type: sequelize.STRING
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
        type: sequelize.INTEGER,
        allowNull: true
    }
});

// Define associations
Agent.hasMany(Feedback, { foreignKey: 'agent_id' });
Feedback.belongsTo(Agent, { foreignKey: 'agent_id' });

module.exports = Feedback;
