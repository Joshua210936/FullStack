const sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Customer = require('./Customer');
const Listed_Properties = require('../models/Listed_Properties');
const Agent = require('../models/Agent');

const Schedule = db.define('schedule', {
    schedule_id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    customer_id: {
        type: sequelize.INTEGER,
        references: {
            model: Customer,
            key: 'Customer_id'
        }
    },
    agent_id: {
        type: sequelize.INTEGER,
        references: {
            model: Agent,
            key: 'agent_id'
        }
    },
    property_id: {
        type: sequelize.INTEGER,
        references: {
            model: Listed_Properties,
            key: 'Property_ID'
        }
    },
    date_selected: {
        type: sequelize.DATEONLY
    },
    time_selected: {
        type: sequelize.TIME
    }
});

// Set up the associations
Customer.hasMany(Schedule, { foreignKey: 'customer_id' });
Agent.hasMany(Schedule, { foreignKey: 'agent_id' });
Listed_Properties.hasMany(Schedule, { foreignKey: 'property_id' });

Schedule.belongsTo(Customer, { foreignKey: 'customer_id' });
Schedule.belongsTo(Agent, { foreignKey: 'agent_id' });
Schedule.belongsTo(Listed_Properties, { foreignKey: 'property_id' });

module.exports = Schedule;
