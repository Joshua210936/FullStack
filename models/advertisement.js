const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Agent = require('./Agent');

const Advertisement = db.define('advertisement', {
    ad_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ad_title: {
        type: Sequelize.STRING
    },
    ad_content: {
        type: Sequelize.STRING
    },
    ad_image: {
        type: Sequelize.STRING
    },
    agent_id: {
        type: Sequelize.INTEGER,
        references: {
            model: 'agents', 
            key: 'agent_id' 
        }
    },
    description: {
        type: Sequelize.JSON
    },
    date_started: {
        type: Sequelize.DATE,
        allowNull: false
    },
    date_end: {
        type: Sequelize.DATE,
        allowNull: false
    },
    status: {
        type: Sequelize.STRING,
        defaultValue: 'active'
    }
});
Advertisement.belongsTo(Agent, { foreignKey: 'agent_id'});
Agent.hasMany(Advertisement, { foreignKey: 'agent_id' });
module.exports = Advertisement;
