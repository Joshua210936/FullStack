// Required libraries
const express = require('express');
const bodyParser = require("body-parser"); 
const exphbs = require('express-handlebars');
const flash = require('connect-flash');
const app = express();
const path = require('path');
const methodOverride = require('method-override');

//Database
const fullstackDB = require('./config/DBConnection');
fullstackDB.setUpDB(false);
const Feedback = require('./models/Feedback');
const Listed_Properties = require('./models/Listed_Properties');

//Routers
const guestRoute = require("./routes/guest_routes");
const userRoute = require("./routes/user_routes");
const adminRoute = require("./routes/admin_routes");


//Imported helpers
const handlebarFunctions = require('./helpers/handlebarFunctions.js');

//routers
app.use('/', guestRoute);
app.use('/user', userRoute);
app.use('/admin', adminRoute);

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


app.get('/agentListProperty', function(req, res){
    res.render('Property Agent/agentListProperty', {layout:'userMain'});
});

app.post('/agentListProperty', function(req,res){
    let{ propertyType, dateAvailable, bedrooms, bathrooms, squarefootage, yearBuilt, name, description, price, location, propertyPictures} = req.body;
    
    Listed_Properties.create({
        Property_Type: propertyType,
        Date_Available: dateAvailable,
        Property_Bedrooms: bedrooms,
        Property_Bathrooms: bathrooms,
        Square_Footage: squarefootage,
        Year_Built: yearBuilt,
        Property_Name: name,
        Property_Description: description,
        Property_Price: price,
        Property_Address: location,
        Property_Image: propertyPictures
    })
    .then(property => {
        res.status(201).send({ message: 'Property listed successfully!', property });
      })
    .catch(err => {
    res.status(400).send({ message: 'Error listing property', error: err });
    });
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
            ['feedback_id', 'DESC']
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

app.put('/saveFeedback/:id', (req, res) => { 
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

app.listen(port, ()=>{
    console.log(`Server running on  http://localhost:${port}`)
});