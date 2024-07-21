const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
const moment = require("moment");
router.use(bodyParser.urlencoded({ extended: true }));
const methodOverride = require('method-override');
const { Op, fn, col } = require('sequelize');

//Database imports
const Feedback = require('../models/Feedback');
const Listed_Properties = require('../models/Listed_Properties');
const Agent = require('../models/Agent');
const Customer = require('../models/custUser');
const Schedule = require('../models/schedule');
const Amenity = require('../models/propertyAmenities')

router.put('/saveFeedback/:id', (req, res) => { 
    let feedback_status = 'saved';
    Feedback.update({
        feedback_status
    },{
        where:{
            feedback_id:req.params.id
        }
    }).then((video)=>{
        res.redirect("/adminFeedback");
    }).catch(err=>console.log(err))
});

router.get('/test', (req, res)=>{
    console.log('router connected successfully')
    res.redirect('/adminDashboard')
});

router.get('/adminDashboard', async (req, res) => {
    try {
        const startOfDay = moment().startOf('day').toDate();
        const endOfDay = moment().endOf('day').toDate();

        const feedbacks = await Feedback.findAll({
            attributes: [
                [fn('DATE', col('feedback_date')), 'date'],
                [fn('AVG', col('feedback_rating')), 'averageRating']
            ],
            group: [fn('DATE', col('feedback_date'))],
            raw: true
        });

        const todayFeedback = await Feedback.findOne({
            attributes: [[fn('AVG', col('feedback_rating')), 'averageRating']],
            where: {
                feedback_date: {
                    [Op.between]: [startOfDay, endOfDay]
                }
            },
            raw: true
        });

        const averageRatingToday = todayFeedback ? parseFloat(todayFeedback.averageRating).toFixed(2) : "No feedback today";
        console.log('Average Rating for today:', averageRatingToday);

        const dates = feedbacks.map(fb => fb.date);
        const ratings = feedbacks.map(fb => parseFloat(fb.averageRating));

        const custUser = await Customer.findOne({
            attributes: [[fn('COUNT', col('Customer_id')), 'custCount']],
            raw: true
        });
        
        const custCount = parseInt(custUser.custCount);
        console.log("custCount " + custCount);

        const agent = await Agent.findOne({
            attributes: [[fn('COUNT', col('agent_id')), 'agentCount']],
            raw: true
        });

        const agentCount = parseInt(agent.agentCount);
        console.log("agentCount " + agentCount);

        // Render the adminDashboard with the data
        res.render('Dashboard/adminDashboard', { 
            dates: JSON.stringify(dates), 
            ratings: JSON.stringify(ratings),
            averageRatingToday: averageRatingToday,
            custCount: custCount,
            agentCount: agentCount
        });
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Internal Server Error');
    }
});
module.exports = router;