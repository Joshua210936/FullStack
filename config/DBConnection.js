const mySQLDB = require('./DBConfig');
const Customer = require('../models/Customer');
const Feedback = require('../models/Feedback');
const ListedProperties = require('../models/Listed_Properties');
const Agent = require('../models/Agent');
const Schedule = require('../models/schedule');
const advertisementClicks = require('../models/advertisementClicks');

const setUpDB = (drop) => {
    mySQLDB.authenticate()
        .then(() => {
            console.log('Fullstack DB database connected');
        })
        .then(() => {
            // Define associations with foreign keys
            Agent.hasMany(Feedback, { foreignKey: 'agent_id' });
            Feedback.belongsTo(Agent, { foreignKey: 'agent_id' });

            Agent.hasMany(ListedProperties, { foreignKey: 'agent_id' });
            ListedProperties.belongsTo(Agent, { foreignKey: 'agent_id' });

            return mySQLDB.sync({ force: drop });
        })
        .then(() => {
            console.log('Create table if none exists');
        })
        .catch(err => console.log('Error: ' + err));
};

module.exports = { setUpDB };
