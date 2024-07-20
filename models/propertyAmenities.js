const sequelize = require('sequelize');

const db = require('../config/DBConfig');
const Listed_Properties = require('./Listed_Properties'); // Import the Listed_Properties model

const Amenity = db.define('Amenity', {
    Amenity: {
        type: sequelize.STRING
    }
});


module.exports = Amenity;