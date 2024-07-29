const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const advertisement = require('./advertisement');

const advertisementClicks = db.define('advertisementClicks', {
    adRevnue_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ad_id: {
        type: Sequelize.INTEGER,
        references: {
            model: 'advertisements', 
            key: 'ad_id' 
        }
    },
    clicks: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    pricePerClick: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    monthPeriod: {
        type: Sequelize.DATE,
        allowNull: false
    }
});
advertisementClicks.belongsTo(advertisement, { foreignKey: 'ad_id'});
advertisement.hasMany(advertisementClicks, { foreignKey: 'ad_id' });
module.exports = advertisementClicks;
