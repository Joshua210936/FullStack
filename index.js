const express = require('express');

const app = express();

const exphbs = require('express-handlebars')

app.use(express.static("public"));

let port = 3001;

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

app.listen(port, ()=>{
    console.log(`Server running on  http://localhost:${port}`);
});