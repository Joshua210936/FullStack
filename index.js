// Required libraries
const express = require('express');
const bodyParser = require("body-parser"); 
const exphbs = require('express-handlebars');
const flash = require('connect-flash');
const moment = require('moment');
const app = express();
const path = require('path');
const methodOverride = require('method-override');

//Database
const fullstackDB = require('./config/DBConnection');
fullstackDB.setUpDB(false);
const Feedback = require('./models/Feedback');

//Imported helpers
const handlebarFunctions = require('./helpers/handlebarFunctions.js');

app.use(bodyParser.urlencoded({extended:true})); 
app.use(express.static(path.join(__dirname, '/public'))); 
app.use(flash());
app.use(methodOverride('_method'));

app.engine('handlebars', exphbs.engine({ //part of handlebars setup
    layoutsDir:__dirname+'/views/layouts',
    partialsDir:__dirname+'/views/partials',
    helpers: handlebarFunctions
}));

//sets apps to use handlebars engine
app.set('view engine','handlebars');

app.set('views', path.join(__dirname, 'views'));

app.get('/',function(req,res){ //home page
    res.render('home',{layout:'main'})
});

app.get('/buyHouse',function(req,res){ //buyHouse page
    res.render('buyHouse',{layout:'main'})
});

app.get('/propertyDescription', function(req, res){ //propertyDescription page
    res.render('propertyDescription', {layout:'main'})
});

app.get('/sellHouse',function(req,res){ //buyHouse page
    res.render('sellHouse',{layout:'main'})
});

let port = 3001;

app.set('view engine', 'handlebars');

app.get('/', function(req, res){
    res.render('index', {layout:'main'});
});

app.get('/login', (req,res) => { // User Login page
    res.render('Login/userlogin', {layout:'main'});
});

app.get('/agentLogin', (req,res) => { // User Login page
    res.render('Login/agentLogin', {layout:'main'});
});

app.get('/register', (req, res) => { // User Registration page
    res.render('Login/userReg', {layout:'main'});
});

app.get('/agentRegister', (req, res) => { // User Registration page
    res.render('Login/agentReg', {layout:'main'});
});

app.get('/userAccount', (req,res) => { // User Login page
    res.render('Profile/userAccountManagement', {layout:'userMain'});
});

app.get('/agentAccount', (req, res) => { // User Registration page
    res.render('Profile/agentAccountManagement', {layout:'userMain'});
});

app.get('/aboutUs', function(req, res){
    res.render('About Us/aboutUs', {layout:'main'});
});

app.get('/contactUs', function(req, res){
    res.render('Contact Us/contactUs', {layout:'main'});
});

app.get('/feedbackForm', function(req, res){
    res.render('Contact Us/feedbackForm', {layout:'main'});
});

app.post('/feedbackForm', function (req, res) {
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

app.get('/agentListProperty', function(req, res){
    res.render('Property Agent/agentListProperty', {layout:'userMain'});
});

app.get('/propertyAgentProfile', function(req, res){
    res.render('Property Agent/propertyAgentProfile', {layout:'userMain'});
});

app.get('/findAgents', function(req, res){
    res.render('Property Agent/findAgents', {layout:'main'});
});

app.get('/schedule', function(req, res){
    res.render('schedule', {layout:'userMain'});
});

app.get('/adminDashboard', function(req, res){
    res.render('Dashboard/adminDashboard', {layout:'adminMain'});
});

app.get('/adminAgentsView', function(req, res){
    res.render('adminAgentsView', {layout:'adminMain'});
});

app.get('/adminUsersView', function(req, res){
    res.render('adminUsersView', {layout:'adminMain'});
});

app.get('/advertisement', function(req, res){
    res.render('Advertisements/advertisement', {layout:'adminMain'});
});

app.get('/adminFeedback', function(req, res){
    Feedback.findAll({
        order: [
            ['feedback_date', 'DESC']
        ],
        raw:true
    })
    .then((feedback)=>{
        console.log(feedback)
        res.render('Contact Us/adminFeedback', {layout:'adminMain', feedback:feedback});
    })
});

app.get('/adminPropertiesView', function(req, res){
    res.render('adminPropertiesView', {layout:'adminMain'});
});

app.get('/addAdvertisement', function(req, res){
    res.render('Advertisements/addAdvertisement', {layout:'adminMain'});
});

app.get('/registerPropertyAgent', function(req, res){
    res.render('agentRegister', {layout:'adminMain'});
});

app.listen(port, ()=>{
    console.log(`Server running on  http://localhost:${port}`)
});