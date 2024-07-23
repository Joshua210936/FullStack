const sequelize = require('sequelize');

const db = require('../config/DBConfig');


const Agent = db.define('agent', {
    agent_id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    agent_firstName: {
        type : sequelize.STRING
    },
    agent_lastName: {
        type: sequelize.STRING
    },
    agent_phoneNumber: {
        type: sequelize.INTEGER
    },
    agent_email: {
        type: sequelize.STRING
    },
    agent_licenseNo: {
        type: sequelize.STRING
    },
    agent_registrationNo: {
        type: sequelize.STRING
    },
    agent_bio: {
        type: sequelize.STRING
    },
    agent_image: {
        type: sequelize.STRING
    },
    agent_password: {
        type: sequelize.STRING
    },
    status: {
        type: sequelize.STRING
    } 
});

module.exports = Agent;