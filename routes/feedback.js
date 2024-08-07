const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
const moment = require("moment");
const cookieParser = require("cookie-parser");
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const nodemailer = require('nodemailer');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(cookieParser());
router.use(methodOverride('_method'));

//Database imports
const Feedback = require('../models/Feedback');
const Agent = require('../models/Agent');

router.get('/contactUs', function (req, res) {
    console.log('found');
    res.render('Contact Us/contactUs', { layout: 'main' });
});

router.get('/feedbackForm', function (req, res) {
    res.render('Contact Us/feedbackForm');
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sigma0properties@gmail.com',
        pass: 'jqux gnod pbgs oqpe'
    }
});

router.post('/feedbackForm', async function (req, res) {
    let errorList = [];
    console.log(req.body);
    let { Name, Email, VisitReason, AgentID, Description, Rating } = req.body;
    let FeedbackDate = moment().format('YYYY/MM/DD');
    let Status = "Normal";

    if (Rating == 0) {
        errorList.push("Please choose a star rating");
    }

    if (VisitReason == "Choose") {
        errorList.push("Please choose a visit reason");
    }

    if (Description.trim() === '') {
        errorList.push("Enter feedback description");
    }

    if (AgentID && AgentID.trim() !== '') {
        try {
            const agent = await Agent.findOne({ where: { agent_id: AgentID } });
            if (!agent) {
                errorList.push("Agent not found");
            }
        } catch (err) {
            console.error("Error checking agent:", err);
            errorList.push("Error occurred while checking agent");
        }
    }

    console.log("errorList " + errorList.length);
    if (errorList.length === 0) {
        const feedbackData = {
            feedback_type: VisitReason,
            feedback_name: Name,
            feedback_email: Email,
            feedback_date: FeedbackDate,
            feedback_rating: Rating,
            feedback_description: Description,
            feedback_status: Status
        };

        if (AgentID && AgentID.trim() !== '') {
            feedbackData.agent_id = AgentID;
        }

        try {
            const result = await Feedback.create(feedbackData);
            console.log('Insert successful:', result);
            let msg_sucess = "Feedback submitted successfully";
            res.render('Contact Us/contactUs', { layout: 'main', success_msg:msg_sucess});
        } catch (err) {
            console.error("Error creating feedback:", err);
            errorList.push("Error occurred while creating feedback");
            renderFormWithErrors(res, errorList, req.body);
        }
    } else {
        renderFormWithErrors(res, errorList, req.body);
    }
});

function renderFormWithErrors(res, errors, formData) {
    res.render('Contact Us/feedbackForm', { 
        layout: 'main', 
        error_msg: errors.join('\n'), 
        formData: formData 
    });
}

router.put('/saveFeedback/:id', (req, res) => {
    console.log("In saveFeedback");
    let feedback_status = 'Saved';
    Feedback.update({
        feedback_status
    }, {
        where: {
            feedback_id: req.params.id
        }
    }).then((feedback) => {
        res.redirect("/feedback/adminFeedback");
    }).catch(err => console.log(err))
});

router.put('/unsaveFeedback/:id', (req, res) => {
    console.log("In saveFeedback");
    let feedback_status = 'Normal';
    Feedback.update({
        feedback_status
    }, {
        where: {
            feedback_id: req.params.id
        }
    }).then((feedback) => {
        res.redirect("/feedback/adminFeedback");
    }).catch(err => console.log(err))
});

router.get('/adminFeedback', function(req, res){
    Feedback.findAll({
        include: [{
            model: Agent,
            as: 'agent',
            attributes: ['agent_firstName'],
            required: false  // This makes the join optional
        }],
        order: [['feedback_id', 'DESC']]
    })
    .then((feedback)=>{
        console.log(feedback)
        res.render('Contact Us/adminFeedback', {layout:'adminMain', feedback:feedback});
    })
});

router.post('/sendFeedbackResponse', async function (req, res) {
    let { email, emailContent } = req.body;
    console.log("Recipient: " + email);
    console.log("Content: " + emailContent);

    const mailOptions = {
        from: 'sigma0properties@gmail.com',
        to: email, // Use the email from the form
        subject: 'Reply to feedback',
        text: emailContent // Use the content from the form
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).send({ message: 'Error sending email' });
        } else {
            console.log('Email sent:', info.response);
            res.redirect('/feedback/adminFeedback');
        }
    });
});

module.exports = router;