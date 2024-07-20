const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
const moment = require("moment");
const cookieParser = require("cookie-parser");
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');

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

router.post('/feedbackForm', async function (req, res) {
    let errorList = []
    console.log(req.body);
    let { Name, Email, VisitReason, AgentID, Description, Rating } = req.body;
    let FeedbackDate = moment().format('YYYY/MM/DD');
    let Status = "Normal";

    if (Rating == 0) {
        errorList.push("Please choose a star rating")
    }

    if (VisitReason == "Choose") {
        errorList.push("Please choose a visit reason")  // Fixed the error message
    }

    if (Description.trim == ''){
        errorList.push("Enter feedback description")
    }

    if (AgentID && AgentID.trim() !== '') {
        try {
            const agent = await Agent.findOne({ agent_id: AgentID });
            if (!agent) {
                errorList.push("Agent not found")
            }
        } catch (err) {
            console.error("Error checking agent:", err);
            errorList.push("Error occurred while checking agent")
        }
    }

    console.log("errorList " + errorList.length);
    if (errorList.length == 0) {
        try {
            const result = await Feedback.create({
                feedback_type: VisitReason,
                feedback_name: Name,
                feedback_email: Email,
                feedback_date: FeedbackDate,
                feedback_rating: Rating,
                feedback_description: Description,
                feedback_status: Status,
                agentAgentId: AgentID
            });
            console.log('Insert successful:', result);
            res.render('Contact Us/contactUs', { layout: 'main' });
        } catch (err) {
            console.error("Error creating feedback:", err);
            errorList.push("Agent not found");
            renderFormWithErrors(res, errorList, req.body);
        }
    } else {
        renderFormWithErrors(res, errorList, req.body);
    }
});

function renderFormWithErrors(res, errorList, formData) {
    console.log("Has error");
    let msg_error = errorList.join("\n");
    console.log(msg_error);
    res.render("Contact Us/feedbackForm", {
        layout: "main", 
        error_msg: msg_error,
        formData: formData  // Pass form data back to pre-fill the form
    });
}

router.put('/saveFeedback/:id', (req, res) => {
    console.log("In saveFeedback");
    let feedback_status = 'saved';
    Feedback.update({
        feedback_status
    }, {
        where: {
            feedback_id: req.params.id
        }
    }).then((feedback) => {
        res.redirect("/adminFeedback");
    }).catch(err => console.log(err))
});

module.exports = router;