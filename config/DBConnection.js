const mySQLDB = require('./DBConfig');
const user = require('../models/custUser');
const feedback = require('../models/Feedback');
const listed_properties = require('../models/Listed_Properties');
const agent = require('../models/Agent');
const schedule = require('../models/Schedule');

const setUpDB = (drop) => {
    mySQLDB.authenticate()
        .then(() => {
            console.log('Fullstack DB database connected');
        })
        .then(() => {
            /*user.hasMany(video);*/
            mySQLDB.sync({
                force: drop
            }).then(() => {
                console.log('Create table if none exists')
            }).catch(err => console.log(err));
        })
        .catch(err => console.log('Error: ' +  err));
};

module.exports = { setUpDB };