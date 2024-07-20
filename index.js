// Required libraries
const express = require('express');
const bodyParser = require("body-parser"); 
const exphbs = require('express-handlebars');
const flash = require('connect-flash');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const Handlebars = require('handlebars');

//Database
const fullstackDB = require('./config/DBConnection');
fullstackDB.setUpDB(false);
const db = require('./config/db');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const Feedback = require('./models/Feedback');
const Listed_Properties = require('./models/Listed_Properties');
const Agent = require('./models/Agent');
const Customer = require('./models/custUser');
const Schedule = require('./models/schedule');
const Amenity = require('./models/propertyAmenities')


//Routers
const guestRoute = require("./routes/guest_routes");
const userRoute = require("./routes/user_routes");
const adminRoute = require("./routes/admin_routes");
const feedbackRoute = require("./routes/feedback.js");

//Imported helpers
const handlebarFunctions = require('./helpers/handlebarFunctions.js');
const { password } = require('./config/db.js');

//JSON for handlebars (idk i need it for my modal)
Handlebars.registerHelper('json', function (context) {
    return JSON.stringify(context);
});
Handlebars.registerHelper('parseJson', function (context) {
    return JSON.parse(context);
});

//routers
app.use('/user', userRoute);
app.use('/admin', adminRoute);
app.use('/feedback', feedbackRoute);

app.use(bodyParser.urlencoded({extended:true})); 
app.use(express.static(path.join(__dirname, '/public'))); 
app.use(flash());
app.use(methodOverride('_method'));

const options = {
    host: db.host,
    port: db.port,
    user: db.username,
    password: db.password,
    database: db.database
}
const sessionStore = new MySQLStore(options);

app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true }
}));

// Sets our js files to be the correct MIME type. Dont delete or js files wont be linked due to an error
app.use(express.static('public/js', {
    setHeaders: (res, path, stat) => {
      if (path.endsWith('.js')) {
        res.set('Content-Type', 'application/javascript');
      }
    }
  }));

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

app.get('/customer' ,function(req,res){ //customer page
    res.render('customerHome',{layout:'userMain'})
});

app.get('/buyHouse',function(req,res){ //buyHouse page
    Listed_Properties.findAll()
        .then(properties => {
            res.render('buyHouse', {
                layout: 'main',
                properties: properties.map(properties => properties.get({ plain: true })), // Convert to plain objects 
                json: JSON.stringify // Pass JSON.stringify to the template
            });
        })
        .catch(err => {
            console.error('Error fetching properties:', err);
            if (!res.headersSent) {
                res.status(500).send('Internal Server Error');
            }
        });
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

// User Login and Registration
app.get('/login', (req,res) => { // User Login page
    res.render('Login/userlogin', {layout:'main'});
});

app.post('/login', function (req, res) {
    let { email, password } = req.body;

    // Find the customer with the given email
    Customer.findOne({ where: { Customer_Email: email } }) 
        .then(user => {
            if (!user) {
                return res.status(404).send({ message: 'User not found' });
            }

            // Check if the password is correct
            if (user.Customer_Password !== password) {
                return res.status(401).send({ message: 'Incorrect password' });
            }

            // Successful login
            req.session.user = user; // Store user information in session
            res.redirect('/customer');
        })
        .catch(err => {
            console.log('Error during login: ', err);
           return res.status(500).send({ message: 'Error occurred', error: err });
        });
});

app.get('/register', (req, res) => { // User Registration page
    res.render('Login/userReg',{layout:'main'});
});

app.post('/register', async function (req, res) {
    let errorsList = [];
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
        errorsList.push({ text: 'Passwords do not match' });
        return res.status(400).send({ message: 'Passwords do not match' });
    }

    // Check if email already exists
    var exists = false;
    for (var cust of data) {
        if (cust.toJSON().Customer_Email == email) {
            // return res.status(400).send("Email already exists.")
            errorsList.push({ text: 'Email already exists' });
            
        }
    }

    // Check if phone number is valid
    const phoneNumberPattern = /^[89]\d{7}$/;
    if (!phoneNumberPattern.test(phoneNumber)) {
        errorsList.push({ message: 'Phone number must be 8 digits and start with 8 or 9' });
    }

    // Check if password is valid
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordPattern.test(password)) {
        errorsList.push({ message: 'Password must be at least 8 characters long, include at least one capital letter, and one number' });
    }

    if (errorsList.length > 0) {
        let msg_success = "Success message using success_msg!";
        let msg_error = "";
        for (let i = 0; i < errorsList.length; i++) {
            msg_error += errorsList[i].text + "\n";
        }

        res.render('Login/userReg',{layout:'main', success_msg:msg_success, error_msg:msg_error});
    } else {
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
    }
});

app.get('/userSetProfile/:customer_id', async (req, res) => {
    const customer_id = req.params.customer_id;
    try {
        const customer = await Customer.findByPk(customer_id);
        if (customer) {
            res.render('Customer/userSetProfile', { 
                layout: 'userMain', 
                customer: customer.get({ plain: true })
            });
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customer details', error });
    }
});

app.put('/userSetprofile/:customer_id', (req,res) => {
    let {firstName, lastName, phoneNumber, birthday} = req.body;
    Customer.update({
        Customer_fName: firstName,
        Customer_lName: lastName,
        Customer_Phone: phoneNumber,
        Customer_Birthday: birthday,
    },{
        where:{
            Customer_Email: email
        }
    }).then((Customer)=>{
        res.redirect("/userSetprofile");
    }).catch(err=>console.log(err))
});

app.get('/logout', function (req, res) {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send({ message: 'Error logging out', error: err });
        }
        res.redirect('/login');
    });
});

app.get('/adminUsersView', function(req, res){
    Customer.findAll()
    .then((customers)=>{
        res.render('adminUsersView', {
            layout:'adminMain', 
            customers:customers.map(customer=>{
                customer = customer.get({plain:true});
                return customer;    
            })
        });
    })
    .catch(err => {
        console.error('Error fetching customers:', err);
        res.status(500).send('Internal Server Error');
    });
});


// Agent Login and Registration
app.get('/agentLogin', (req,res) => { // User Login page
    res.render('Login/agentLogin', {layout:'main'});
});

app.get('/agentRegister', (req, res) => { // User Registration page
    res.render('Login/agentReg', {layout:'main'});
});

app.post('/agentRegister', function(req,res){
    let{ firstName, lastName, phone, email, agency_license, agency_registration, bio, agentPictures, password, confirmPassword, status} = req.body;
    
    Agent.create({
        agent_firstName: firstName,
        agent_lastName: lastName,
        agent_phoneNumber: phone,
        agent_email: email,
        agent_licenseNo: agency_license,
        agent_registrationNo: agency_registration,
        agent_bio: bio,
        agent_image: agentPictures,
        agent_password: password,
        agent_confirmpassword: confirmPassword,
        status: status
        
    })
    .then(agent => {
        res.status(201).send({ message: 'Agent registered successfully!', agent });
      })
    .catch(err => {
    res.status(400).send({ message: 'Error registering agent', error: err });
    });
});



app.get('/agentSetprofile', (req,res) => { // Agent Set profile page
    res.render('Property Agent/agentSetprofile', {layout:'userMain'});
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

app.post('/agentListProperty', async function(req,res){
    let{
        name, propertyType, address, propertyImage, price, sqft, bedrooms, bathrooms
        , yearBuilt, floorLevel, topDate, tenure, description, agentID, amenities
    } = req.body;
    
    if (!amenities) {
        amenities = [];
    } else if (typeof amenities === 'string') {
        try {
            amenities = JSON.parse(amenities);
        } catch (e) {
            amenities = [amenities];
        }
    } else if (!Array.isArray(amenities)) {
        amenities = [amenities];
    }

    const property = await Listed_Properties.create({
        Property_Name: name,
        Property_Type: propertyType,
        Property_Address: address,
        Property_Image: propertyImage,
        Property_Price: price,
        Square_Footage: sqft,
        Property_Bedrooms: bedrooms,
        Property_Bathrooms: bathrooms,
        Property_YearBuilt: yearBuilt,
        Property_Floor: floorLevel,
        Property_TOP: topDate,
        Property_Tenure: tenure,
        Property_Description: description,
        agent_id: agentID
    })
    if (amenities.length > 0) {
        const amenityPromises = amenities.map(amenity => {
            return Amenity.create({
                Amenity: amenity,
                Property_ID: property.Property_ID
            });
        });
        await Promise.all(amenityPromises);
    }
        res.redirect('/agentListProperty');
});




app.get('/findAgents', function (req, res) {
    // Assuming you have a model named `Agent` for fetching agents
    Agent.findAll({
        where: {
            status: 'approved'
        }
    })
    .then(agents => {
        // Convert agents to plain objects for rendering
        res.render('Property Agent/findAgents', {
            layout: 'main',
            agents: agents.map(agent => {
                agent = agent.get({ plain: true });
                return agent;
            })
        });
    })
    .catch(err => {
        console.error('Error fetching agents:', err);
        res.status(500).send('Internal Server Error');
    });
});

app.get('/propertyAgentProfile/:id', function (req, res) {
    const agentId = req.params.id;

    // Fetch the agent with the given ID from the database
    Agent.findByPk(agentId)
        .then(agent => {
            if (!agent) {
                return res.status(404).send('Agent not found');
            }

            // Convert agent to a plain object for rendering
            agent = agent.get({ plain: true });

            

            // Render the propertyAgentProfile template with the agent's data
            res.render('Property Agent/propertyAgentProfile', {
                layout: 'main',
                agent: agent
            });
        })
        .catch(err => {
            console.error('Error fetching agent:', err);
            res.status(500).send('Internal Server Error');
        });
});


app.get('/schedule', function(req, res){
    res.render('schedule', {layout:'userMain'});
});

app.post('/schedule', function(req,res){
    let{ propertyType, dateAvailable, bedrooms, bathrooms, squarefootage, yearBuilt, name, description, price, location, propertyPictures} = req.body;
    
    Schedule.create({
        customer_id: propertyType,
        agent_id: dateAvailable,
        property_id: bedrooms,
        date_selected: bathrooms,
        Square_Footage: squarefootage,
        time_selected: yearBuilt,
       
    })
    .then(property => {
        res.status(201).send({ message: 'Property listed successfully!', property });
      })
    .catch(err => {
    res.status(400).send({ message: 'Error listing property', error: err });
    });
});


app.get('/adminAgentsView', function (req, res) {
    Agent.findAll()
        .then(agents => {
            res.render('adminAgentsView', {
                layout: 'adminmain',
                agents: agents.map(agent => {
                    agent = agent.get({ plain: true });

                    return agent;
                })
            });
        })
        .catch(err => {
            console.error('Error fetching agent:', err);
            res.status(500).send('Internal Server Error');
        });
});


app.get('/agents', async (req, res) => {
    try {
        const agents = await Agent.findAll();
        res.json(agents);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching agents', error });
    }
});



// Approve an agent
app.post('/approveAgent/:id', async (req, res) => {
    const agentId = req.params.id;
    try {
        const agent = await Agent.findByPk(agentId);
        if (agent) {
            agent.status = 'approved';
            await agent.save();
            res.json({ message: 'Agent approved successfully', agent });
        } else {
            res.status(404).json({ message: 'Agent not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error approving agent', error });
    }
});

// Unapprove an agent
app.post('/unapproveAgent/:id', async (req, res) => {
    const agentId = req.params.id;
    try {
        const agent = await Agent.findByPk(agentId);
        if (agent) {
            agent.status = 'unapproved';
            await agent.save();
            res.json({ message: 'Agent unapproved successfully', agent });
        } else {
            res.status(404).json({ message: 'Agent not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error unapproving agent', error });
    }
});

// Assuming Express is used
app.get('/getAgent/:id', async (req, res) => {
    const agentId = req.params.id;
    try {
        const agent = await Agent.findByPk(agentId);
        if (agent) {
            res.json(agent);
        } else {
            res.status(404).json({ message: 'Agent not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching agent details', error });
    }
});



// Delete an agent
app.delete('/deleteAgent/:id', async (req, res) => {
    const agentId = req.params.id;
    try {
        const agent = await Agent.findByPk(agentId);
        if (agent) {
            await agent.destroy();
            res.json({ message: 'Agent deleted successfully' });
        } else {
            res.status(404).json({ message: 'Agent not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting agent', error });
    }
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

