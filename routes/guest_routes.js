const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
const moment = require("moment");
router.use(bodyParser.urlencoded({ extended: true }));

//Database imports
const Customer = require('../models/custUser');

router.post('/login', function (req, res) {
    let { email, password } = req.body;

    // Find the customer with the given email
    Customer.findOne({ Customer_Email: email })
        .then(user => {
            if (!user) {
                return res.status(404).send({ message: 'User not found' });
            }

            // Check if the password is correct
            if (user.Customer_Password !== password) {
                return res.status(401).send({ message: 'Incorrect password' });
            }

            // Successful login
            // res.status(200).send({ message: 'Login successful', user });
            alert("Login successful");
            res.redirect('/home');
        })
        .catch(err => {
            res.status(500).send({ message: 'Error occurred', error: err });
        });
});

router.post('/register', async function (req, res) {
    let errors = [];
    let { firstName, lastName, phoneNumber, email, birthday, password, confirmPassword } = req.body;
    if (!email) {
        return res.status(400).send("One or more required payloads were not provided.")

    }

    const data = await Customer.findAll({
        attributes: ["Customer_Email"]
    });
    console.log(data);
    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
        errors.push({ text: 'Passwords do not match' });
        return res.status(400).send({ message: 'Passwords do not match' });
    }

    // Check if email already exists
    var exists = false;
    for (var cust of data) {
        if (cust.toJSON().Customer_Email == email) {
            return res.status(400).send("Email already exists.")

        }
    }

    // Check if phone number is valid
    const phoneNumberPattern = /^[89]\d{7}$/;
    if (!phoneNumberPattern.test(phoneNumber)) {
        return res.status(450).send({ message: 'Phone number must be 8 digits and start with 8 or 9' });
    }

    // Check if password is valid
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordPattern.test(password)) {
        return res.status(400).send({ message: 'Password must be at least 8 characters long, include at least one capital letter, and one number' });
    }

    // Create new customer
    Customer.create({
        Customer_fName: firstName,
        Customer_lName: lastName,
        Customer_Phone: phoneNumber,
        Customer_Email: email,
        Customer_Birthday: birthday,
        Customer_Password: password,
    })
        .then(user => {
            // Redirect to login page
            res.redirect('/login');
        })
        .catch(err => {
            res.status(400).send({ message: 'Error registering user', error: err });
        });
});

module.exports = router;