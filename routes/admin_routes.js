const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
const moment = require("moment");
router.use(bodyParser.urlencoded({ extended: true }));
const methodOverride = require('method-override');

//Database imports
const Feedback = require('../models/Feedback');

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
        // Fetch feedback data
        const feedbacks = await Feedback.findAll({
            attributes: ['feedback_date', 'feedback_rating'],
            raw: true
        });

        // Extract data for plotting
        const dates = feedbacks.map(fb => fb.feedback_date);
        const ratings = feedbacks.map(fb => fb.feedback_rating);

        // Render the adminDashboard with the data
        res.render('Dashboard/adminDashboard', { 
            dates: JSON.stringify(dates), 
            ratings: JSON.stringify(ratings) 
        });
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Internal Server Error');
    }
});
module.exports = router;