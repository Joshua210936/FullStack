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
})

module.exports = router;