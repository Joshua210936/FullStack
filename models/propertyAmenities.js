const sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Listed_Properties = require('./Listed_Properties'); 

const Amenity = db.define('Amenity', {
    Amenity: {
        type: sequelize.STRING
    },
    Property_ID: {
        type: sequelize.INTEGER,
        references: {
            model: Listed_Properties,
            key: 'Property_ID'
        }
    }
});

Listed_Properties.hasMany(Amenity, { foreignKey: 'Property_ID' });
Amenity.belongsTo(Listed_Properties, { foreignKey: 'Property_ID' });

module.exports = Amenity;