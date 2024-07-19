const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
const moment = require("moment");
router.use(bodyParser.urlencoded({ extended: true }));

//Database imports
const Feedback = require('../models/Feedback');
const Customer = require('../models/custUser');

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

router.post('/register', function(req, res) {
    let { firstName, lastName, phoneNumber, email, birthday, password, confirmPassword } = req.body;
    console.log(firstName);
    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
        return res.status(400).send({ message: 'Passwords do not match' });
    }
    Customer.create({
        Customer_fName: firstName,
        Customer_lName: lastName,
        Customer_Phone: phoneNumber,
        Customer_Email: email,
        Customer_Birthday: birthday,
        Customer_Password: password,
        Customer_cPassword: confirmPassword
    })
    .then(user => {
        console.log('User registered:');
        //res.status(201).send({ message: 'User registered successfully!', user });
        // Redirect to login page
        res.redirect('/login');
    })
    .catch(err => {
        // res.status(400).send({ message: 'Error registering user', error: err });
    });
});

module.exports = router;