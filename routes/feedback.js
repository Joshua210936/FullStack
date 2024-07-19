const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
const moment = require("moment");
const cookieParser = require("cookie-parser");
const methodOverride = require('method-override');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(cookieParser());
router.use(methodOverride('_method'));

//Database imports
const Feedback = require('../models/Feedback');

router.get('/feedbackForm', function(req, res){
    console.log('found');
    res.render('Contact Us/feedbackForm', {layout:'main'});
});

router.post('/feedbackForm', function (req, res) {
    console.log(req.body);
    let { Name, Email, VisitReason, Description, Rating } = req.body;
    let FeedbackDate = moment().format('YYYY/MM/DD');
    let Status = "Pending";

    Feedback.create({ 
        feedback_type: VisitReason, 
        feedback_name: Name, 
        feedback_email: Email, 
        feedback_date: FeedbackDate, 
        feedback_rating: Rating, 
        feedback_description: Description, 
        feedback_status: Status 
    })
    .then(result => {
        console.log('Insert successful:', result);
        res.render('Contact Us/contactUs', { layout: 'main' });
    })
    .catch(err => {
        console.error('Insert failed:', err);
        res.status(500).send('Error occurred: ' + err.message);
    });
});

router.put('/saveFeedback/:id', (req, res) => { 
    console.log("In saveFeedback");
    let feedback_status = 'saved';
    Feedback.update({
        feedback_status
    },{
        where:{
            feedback_id:req.params.id
        }
    }).then((feedback)=>{
        res.redirect("/adminFeedback");
    }).catch(err=>console.log(err))
});

module.exports = router;