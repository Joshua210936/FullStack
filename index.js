const express = require('express');

const bodyParser = require("body-parser"); //imported body-parser

const exphbs = require('express-handlebars');

const app = express();

const path = require('path');

app.use(bodyParser.urlencoded({extended:true})); //part of body-parser import

app.use(express.static(path.join(__dirname, '/public'))); 

app.engine('handlebars', exphbs.engine({ //part of handlebars setup
    layoutsDir:__dirname+'/views/layouts',
    partialsDir:__dirname+'/views/partials'
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

// app.use(express.static("public"));

let port = 3001;

// app.get('/', (req, res)=> {
//     res.sendFile(__dirname+"/public/Home.html")
// });
app.engine('handlebars', exphbs.engine({
    layoutsDir:__dirname+'/views/layouts',
    partialsDir:__dirname+'/views/partials/'
}));

app.set('view engine', 'handlebars');

app.get('/', function(req, res){
    res.render('index', {layout:'main'});
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

app.get('/agentListProperty', function(req, res){
    res.render('Property Agent/agentListProperty', {layout:'main'});
});

app.get('/findAgents', function(req, res){
    res.render('Property Agent/findAgents', {layout:'main'});
});

app.listen(port, ()=>{
    console.log(`Server running on  http://localhost:${port}`)
});