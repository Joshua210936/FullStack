// Required libraries
const express = require('express');
const bodyParser = require("body-parser"); 
const exphbs = require('express-handlebars');
const flash = require('connect-flash');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const Handlebars = require('handlebars');
const multer = require('multer');
const fs = require('fs');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');

//Database
const fullstackDB = require('./config/DBConnection');
fullstackDB.setUpDB(false);
const db = require('./config/db');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const Feedback = require('./models/Feedback');
const Listed_Properties = require('./models/Listed_Properties');
const Agent = require('./models/Agent');
const Customer = require('./models/Customer');
const Schedule = require('./models/schedule');
const Amenity = require('./models/propertyAmenities');
const Advertisement = require('./models/advertisement');
const advertisementClicks = require('./models/advertisementClicks');

//Routers
const guestRoute = require("./routes/guest_routes");
const userRoute = require("./routes/user_routes");
const adminRoute = require("./routes/admin_routes");
const feedbackRoute = require("./routes/feedback.js");

//Imported helpers
const handlebarFunctions = require('./helpers/handlebarFunctions.js');
const { password } = require('./config/db.js');
const { error, clear } = require('console');
const { layouts } = require('chart.js');
const { Session } = require('inspector');
const { formatDate } = require('./helpers/handlebarFunctions.js');

//JSON for handlebars (idk i need it for my modal)
Handlebars.registerHelper('json', function (context) {
    return JSON.stringify(context);
});
Handlebars.registerHelper('parseJson', function (context) {
    return JSON.parse(context);
});
Handlebars.registerHelper('eq', function(a, b) {
    return a === b;
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
    database: db.database,
    clearExpired: true,
    checkExpirationInterval: 900000,
    expiration: 86400000
}
const sessionStore = new MySQLStore(options);

app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// For Reset Password
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sigma0properties@gmail.com',
        pass: 'jqux gnod pbgs oqpe'
    }
});

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

app.get('/', async (req, res) => {
    try {

        const advertisements = await Advertisement.findAll({
            include: [{
                model: Agent,
                as: 'agent'
            }]
        });

        const formatDate = (date) => {
            if (!date) return '';
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-based
            const year = d.getFullYear();
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        };

        const advertisementsWithParsedDescription = advertisements.map(ad => {
            try {
                const adData = ad.toJSON();
                const description = JSON.stringify(adData.description).replace(/'/g, '"') || '[]';
                const parsedDescription = JSON.parse(description);

                
                return {
                    ...adData,
                    description: parsedDescription,
                    date_started: formatDate(adData.date_started),
                    date_end: formatDate(adData.date_end),
                    
                    
                };
            } catch (error) {
                console.error('Error parsing description JSON:', error);
                return {
                    ...ad.toJSON(),
                    description: [],
                    date_started: '',
                    date_end: ''
                };
            }
        });

        res.render('home', {
            layout: 'main',
            advertisements: advertisementsWithParsedDescription
        });
    } catch (error) {
        console.error('Error retrieving advertisement:', error);
        res.status(500).send('Server error');
    }
});

// for image
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/'); // Save files to public/images
    },
    filename: (req, file, cb) => {
        const filePath = path.join('public/images/', file.originalname);

        // Check if file exists
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                // File does not exist, proceed with the upload
                cb(null, file.originalname);
            } else {
                // File exists, use the existing file name
                cb(null, file.originalname);
            }
        });
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = allowedTypes.test(file.mimetype);

        if (mimeType && extName) {
            return cb(null, true);
        } else {
            cb(new Error('Only JPG, JPEG, and PNG images are allowed'));
        }
    }
});

const upload = multer({ storage: storage });
//
app.get('/adminHome', function(req, res){
    res.render('adminHome', {layout:'adminMain'});
});

app.get('/customerHome' ,function(req,res){ 
    console.log("this is the session id:", req.session.id);
    console.log('Session:' + JSON.stringify(req.session));
    console.log('Session:' + req.session.customerID);
    res.render('customerHome',{layout:'userMain'})
});

app.get('/agentHome', function(req, res){
    console.log('Agent Session:' + req.session.agentID);
    res.render('agentHome', {layout:'agentMain'});
});

app.get('/buyHouse', async (req, res) => {
    try {
        const properties = await Listed_Properties.findAll({
            where: { Property_Status: true }
        });

        res.render('buyHouse', {
            layout: 'main',
            properties: properties.map(property => property.get({ plain: true })), // Convert to plain objects 
            json: JSON.stringify // Pass JSON.stringify to the template
        });
    } catch (error) {
        console.error('Error fetching properties:', error);
        if (!res.headersSent) {
            res.status(500).send('Internal Server Error');
        }
    }
});

app.get('/propertyDescription/:id', async function(req, res) { 
    try {
        const propertyID = req.params.id;

        const property = await Listed_Properties.findByPk(propertyID);
        if (!property) {
            return res.status(404).send('Property not found');
        }

        const pricePerSquareFoot = (property.Property_Price / property.Square_Footage).toFixed(2);

        const amenities = await Amenity.findAll({
            where: { Property_ID: propertyID }
        });

        const agent = await Agent.findByPk(property.agent_id);
        if (!agent) {
            return res.status(404).send('Agent not found');
        }

        res.render('propertyDescription', {
            layout: 'main',
            propertyDetail: property.dataValues, // Pass the property object
            amenities: amenities.map(a => a.dataValues), // Pass amenities array
            pricePerSquareFoot: pricePerSquareFoot,
            agentDetail: agent.dataValues, // Pass the agent object
            json: JSON.stringify,
        });
    } catch (error) {
        console.error('Error fetching property details:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/sellHouse',function(req,res){
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

app.post('/login', async function (req, res) {
    errorList = [];
    let { email, password } = req.body;

    // Admin credentials
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'Admin12345';

    if (email === adminEmail && password === adminPassword) {
        // Admin login
        req.session.isAdmin = true;
        req.session.userID = 'admin'; // You can store any identifier for the admin user
        console.log('Admin logged in');
        return res.redirect('/adminHome'); // Redirect to the admin home page
    } else {
        // Find the customer with the given email
        Customer.findOne({ where: { Customer_Email: email } })
            .then(customer => {
                if (!customer) {
                    errorList.push({ text: 'customer not found' });
                    console.log('customer not found');
                    return res.status(404).send({ message: 'customer not found' });
                }

                // Check if the password is correct
                if (customer.Customer_Password !== password) {
                    errorList.push({ text: 'Incorrect password' });
                    return res.status(401).send({ message: 'Incorrect password' });
                }

                // Successful customer login
                req.session.isAdmin = false;
                req.session.customerID = customer.Customer_id; // Store customer information in session
                const customer_id = customer.Customer_id;
                console.log(req.session.customerID);
                console.log('Session Test' + JSON.stringify(req.session));
                console.log("session id in login:", req.session.id);
                req.session.save();
                res.redirect('/customerHome');
            })
            .catch(err => {
                console.log('Error during login: ', err);
                return res.status(500).send({ message: 'Error occurred', error: err });
            });
    }
});

app.get('/register', (req, res) => { // User    tration page
    res.render('Login/userReg',{layout:'main'});
});

// Can move the validation to the html side
app.post('/register', async function (req, res) {
    let errorsList = [];
    let { firstName, lastName, phoneNumber, email, birthday, password, confirmPassword } = req.body;
    
    // Check for missing email
    if (!email) {
        return res.status(400).send("One or more required payloads were not provided.");
    }

    try {
        const data = await Customer.findAll({
            attributes: ["Customer_Email"]
        });

        console.log('Retrieved customer emails:', data);

        // Check if password and confirmPassword match
        if (password !== confirmPassword) {
            errorsList.push({ text: 'Passwords do not match' });
        }

        // Check if email already exists
        for (var cust of data) {
            if (cust.toJSON().Customer_Email === email) {
                errorsList.push({ text: 'Email already exists' });
                break;
            }
        }

        // Check if phone number is valid
        const phoneNumberPattern = /^[89]\d{7}$/;
        if (!phoneNumberPattern.test(phoneNumber)) {
            errorsList.push({ text: 'Phone number must be 8 digits and start with 8 or 9' });
        }

        // Check if password is valid
        const passwordPattern = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!passwordPattern.test(password)) {
            errorsList.push({ text: 'Password must be at least 8 characters long, include at least one capital letter, and one number' });
        }

        // If there are errors, render the registration page with error messages
        if (errorsList.length > 0) {
            let msg_error = "";
            for (let i = 0; i < errorsList.length; i++) {
                console.log('Error:', errorsList[i]);
                msg_error += errorsList[i].text + "\n";
            }
            return res.render('Login/userReg', { layout: 'main', error_msg: msg_error });
        }

        // Create new customer
        const newCustomer = await Customer.create({
            Customer_fName: firstName,
            Customer_lName: lastName,
            Customer_Phone: phoneNumber,
            Customer_Email: email,
            Customer_Birthday: birthday,
            Customer_Password: password,
        });

        // Redirect to login page upon successful registration
        res.redirect('/login');
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).send({ message: 'Error registering user', error: err });
    }
});

app.get('/userSetProfile', async (req, res) => {
    const customer_id = req.session.customerID; // IMPORTANT
    console.log('Customer ID:' + customer_id);

    try {
        const customer = await Customer.findByPk(customer_id); // IMPORTANT
        console.log(customer);

        if (customer) {
            res.render('Customer/userSetProfile', {
                layout: 'userMain',
                customer_id: customer_id,
                customer: customer.get({ plain: true })
            });
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customer details', error });
    }
});

app.post('/userSetProfile', async (req, res) => {
    console.log(req.body);
    const { firstName, lastName, phoneNumber, birthday } = req.body;
    const customer_id = req.session.customerID;
    console.log('Session Test' + JSON.stringify(req.session));
    console.log("session id in set profile:", req.session.customerID);
    
    console.log('Received customer ID:', customer_id); // Log customer ID
    console.log('Received update data:', { firstName, lastName, phoneNumber, birthday }); // Log update data
    
    try {
        const customer = await Customer.findByPk(customer_id);
        if (customer) {
            await Customer.update(
                {
                    Customer_fName: firstName,
                    Customer_lName: lastName,
                    Customer_Phone: phoneNumber,
                    Customer_Birthday: birthday,
                },
                {
                    where: {
                        Customer_id: customer_id
                    }
                }
            );
            res.redirect(`/userSetProfile`);
        } else {
            res.status(404).send("Customer not found");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating customer profile");
    }
});

// ---------------------- Reset Password --------------------------
// Route to render forget password page
app.get('/forgetpassword', (req, res) => {
    res.render('Login/forgetpassword', { layout: 'main' });
});

// Route to handle OTP request
app.post('/requestOTP', async (req, res) => {
    const { email } = req.body;
    const customer = await Customer.findOne({ where: { Customer_Email: email } });

    if (!customer) {
        return res.status(404).send({ message: 'Customer not found' });
    }

    // Generate OTP and expiration time
    const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
    const otpExpiration = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    await customer.update({
        Customer_OTP: otp,
        OTP_Expiration: otpExpiration
    });

    // Send OTP email
    const mailOptions = {
        from: 'sigma0properties@gmail.com',
        to: email,
        subject: 'Your OTP for password reset',
        text: `Your OTP for password reset is: ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending OTP email:', error);
            return res.status(500).send({ message: 'Error sending OTP email' });
        } else {
            console.log('OTP email sent:', info.response);
            res.redirect('/verifyOTP');
        }
    });
});

// Route to render verify OTP page
app.get('/verifyOTP', (req, res) => {
    res.render('Login/verifyOTP', { layout: 'main' });
});

// Route to handle OTP verification and password reset
app.post('/verifyOTP', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const customer = await Customer.findOne({ where: { Customer_Email: email } });

    if (!customer) {
        return res.status(404).send({ message: 'Customer not found' });
    }

    if (customer.Customer_OTP !== otp || new Date() > customer.OTP_Expiration) {
        return res.status(400).send({ message: 'Invalid or expired OTP' });
    }

    // Update password and clear OTP fields
    await customer.update({
        Customer_Password: newPassword,
        Customer_OTP: null,
        OTP_Expiration: null
    });

    res.redirect('/login');
});
// ---------------------- Reset Password --------------------------

// User Delete Route
// Need update this route to delete the user
// Need to implement "Are you sure?" & make them enter password to confirm delete
app.post('/deleteUser', async (req, res) => {
    const customer_id = req.session.customer_id;
    console.log('Received customer ID:', customer_id);
    try {
        const customer = await Customer.findByPk(customer_id);
        if (customer) {
            await customer.destroy();
            res.redirect('/login'); // Redirect to an appropriate page after deletion
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({ message: 'Error deleting customer', error });
    }
});

app.get('/logout', function (req, res) {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send({ message: 'Error logging out', error: err });
        }
        res.redirect('/login');
    });
});

// Agent Login and Registration
app.get('/agentLogin', (req,res) => { // Agent Login page
    res.render('Login/agentLogin', {layout:'main'});
});

app.post('/agentLogin', async function (req, res) {
    errorList = [];
    let { email, password } = req.body;

    try {
        // Find the agent with the given email
        const agent = await Agent.findOne({ where: { agent_email: email } });

        if (!agent) {
            errorList.push({ text: 'Agent not found' });
            console.log('Agent not found');
            return res.status(404).send({ message: 'Agent not found' });
        }

        // Check if the password is correct
        if (agent.agent_password !== password) {
            errorList.push({ text: 'Incorrect password' });
            return res.status(401).send({ message: 'Incorrect password' });
        }

        // Successful login
        req.session.isAdmin = false;
        req.session.agentID = agent.agent_id; // Store agent information in session
        console.log('Agent logged in:', req.session.agentID);
        req.session.save();
        res.redirect('/agentHome');
    } catch (err) {
        console.log('Error during login: ', err);
        return res.status(500).send({ message: 'Error occurred', error: err });
    }
});

app.get('/agentRegister', (req, res) => { // User Registration page
    res.render('Login/agentReg', {layout:'agentMain'});
});

app.post('/agentRegister', function(req,res){
    let{ firstName, lastName, phone, email, agency_license, agency_registration, bio, agentPictures, password, status} = req.body;
    
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
        status: status
        
    })
    .then(agent => {
        res.redirect('/agentLogin');
        res.status(201).send({ message: 'Agent registered successfully!', agent });
      })
    .catch(err => {
    res.status(400).send({ message: 'Error registering agent', error: err });
    });
});

app.get('/agentSetProfile', async (req, res) => { // Agent Set profile page
    const agent_id = req.session.agentID;
    console.log('Agent ID:', agent_id);

    try {
        const agent = await Agent.findByPk(agent_id);
        console.log(agent);

        if (agent) {
            res.render('Property Agent/agentSetProfile', {
                layout: 'agentMain',
                agent_id: agent_id,
                agent: agent.get({ plain: true })
            });
        } else {
            res.status(404).json({ message: 'Agent not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching agent details', error });
    }
});
    
app.post('/agentSetProfile', async (req, res) => {
    console.log(req.body);
    const { firstName, lastName, phoneNumber, birthday } = req.body;
    const agent_id = req.session.agentID;
    console.log('Session Test' + JSON.stringify(req.session));
    console.log("Session ID in set profile:", req.session.agentID);

    console.log('Received agent ID:', agent_id); // Log agent ID
    console.log('Received update data:', { firstName, lastName, phoneNumber, birthday }); // Log update data

    try {
        const agent = await Agent.findByPk(agent_id);
        if (agent) {
            await Agent.update(
                {
                    agent_fName: firstName,
                    agent_lName: lastName,
                    agent_phone: phoneNumber,
                    agent_birthday: birthday,
                },
                {
                    where: {
                        agent_id: agent_id
                    }
                }
            );
            res.redirect(`/agentSetProfile`);
        } else {
            res.status(404).send("Agent not found");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating agent profile");
    }
});


app.get('/agentSchedule', (req,res) => { // Agent Set profile page
    res.render('Property Agent/agentSchedule', {layout:'userMain'});
});



app.get('/aboutUs', function(req, res){
    res.render('About Us/aboutUs', {layout:'main'});
});

app.get('/contactUs', function(req, res){
    res.render('Contact Us/contactUs', {layout:'main'});
});

app.get('/agentPropertyOptions', function(req, res){
    res.render('Property Agent/agentPropertyOptions', {layout:'main'});
});

app.get('/agentListProperty', function(req, res){
    const agent_ID = req.session.agentID;
    res.render('Property Agent/agentListProperty', {
        layout: 'main',
        agent_ID: agent_ID, // Convert to plain objects 
        json: JSON.stringify // Pass JSON.stringify to the template
    });
});

app.post('/agentListProperty', async function(req,res){
    let{
        name, propertyType, address, postalCode, propertyImage, propertyAdditionalImages, price, sqft, bedrooms, bathrooms
        , yearBuilt, floorLevel, topDate, tenure, description, agentID, amenities, listedDate
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
        Property_PostalCode: postalCode,
        Property_Image: propertyImage,
        Property_AdditionalImages: propertyAdditionalImages,
        Property_Price: price,
        Square_Footage: sqft,
        Property_Bedrooms: bedrooms,
        Property_Bathrooms: bathrooms,
        Property_YearBuilt: yearBuilt,
        Property_Floor: floorLevel,
        Property_TOP: topDate,
        Property_Tenure: tenure,
        Property_Description: description,
        agent_id: agentID,
        Property_ListedDate: listedDate
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

app.get('/agentUpdateProperty', async (req, res) => {
    try {
        const agentId = req.session.agentID;

        if (!agentId) {
            return res.status(400).send('Agent ID is required');
        }

        const properties = await Listed_Properties.findAll({
            where: { agent_id: agentId }
        });

        res.render('Property Agent/agentUpdateProperty', {
            layout: 'main',
            properties: properties.map(property => property.get({ plain: true })),
            json: JSON.stringify,
        });
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/togglePropertyStatus/:propertyId', async (req, res) => { //code for delist
    const { propertyId } = req.params;
    try {
        const property = await Listed_Properties.findByPk(propertyId);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        property.Property_Status = !property.Property_Status; // Toggle the status
        await property.save();

        res.json({ success: true });
    } catch (error) {
        console.error('Error toggling property status:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

app.get('/agentUpdatePropertyForm/:id', async (req, res) => {
    try {
        const propertyID = req.params.id;
        const property = await Listed_Properties.findByPk(propertyID);
        const amenities = await Amenity.findAll({ where: { Property_ID: propertyID } });

        if (!property) {
            return res.status(404).send('Property not found');
        }

        res.render('Property Agent/agentUpdatePropertyForm', {
            layout: 'main',
            propertyDetail: property.get({ plain: true }),
            amenities: amenities.map(amenity => amenity.get({ plain: true })),
            json: JSON.stringify
        });
    } catch (error) {
        res.status(500).send('Error retrieving property details');
    }
});

app.post('/agentUpdatePropertyForm/:id', async (req, res) => {
    try {
        const propertyID = req.params.id;
        const {
            name,
            propertyType,
            address,
            propertyImage,
            price,
            sqft,
            bedrooms,
            bathrooms,
            yearBuilt,
            floorLevel,
            topDate,
            tenure,
            description,
            agentID,
            amenities
        } = req.body;

        // Update the property details
        await Listed_Properties.update({
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
            agent_id: agentID,
        }, {
            where: { Property_ID: propertyID }
        });

        // Update amenities
        await Amenity.destroy({ where: { Property_ID: propertyID } });
        if (Array.isArray(amenities)) {
            for (const amenity of amenities) {
                await Amenity.create({ Property_ID: propertyID, Amenity: amenity });
            }
        }

        res.redirect(`/agentUpdatePropertyForm/${propertyID}`);
    } catch (error) {
        res.status(500).send('Error updating property details');
    }
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

    Agent.findByPk(agentId, {
        include: [
            { model: Listed_Properties }, // Assuming you have this model defined
            { model: Feedback, as: 'feedbacks' } // Include feedback data with alias
        ]
    })
    .then(agent => {
        if (!agent) {
            return res.status(404).send('Agent not found');
        }

        // Convert agent to a plain object for rendering
        agent = agent.get({ plain: true });
        
        console.log('Fetched agent:', agent); // Log agent data

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





app.get('/schedule', async (req, res) => {
    const { propertyId, agentId } = req.query;

    if (!propertyId || !agentId) {
        return res.status(400).send({ message: 'Property ID or Agent ID is missing' });
    }

    try {
        // Fetch property details
        const property = await Listed_Properties.findByPk(propertyId, {
            attributes: ['Property_ID', 'Property_Name', 'Property_Description', 'Property_Price', 'Square_Footage', 'Property_Bedrooms', 'Property_Bathrooms', 'Property_Image']
        });

        if (!property) {
            return res.status(404).send({ message: 'Property not found' });
        }

        // Fetch agent details
        const agent = await Agent.findByPk(agentId, {
            attributes: ['agent_id', 'agent_firstName', 'agent_lastName', 'agent_email', 'agent_phoneNumber', 'agent_image']
        });

        if (!agent) {
            return res.status(404).send({ message: 'Agent not found' });
        }

        // Create plain objects
        const propertyDetail = {
            Property_ID: property.Property_ID,
            Property_Name: property.Property_Name,
            Property_Description: property.Property_Description,
            Property_Price: property.Property_Price,
            Square_Footage: property.Square_Footage,
            Property_Bedrooms: property.Property_Bedrooms,
            Property_Bathrooms: property.Property_Bathrooms,
            Property_Image: property.Property_Image
        };

        const agentDetail = {
            agent_id: agent.agent_id,
            agent_firstName: agent.agent_firstName,
            agent_lastName: agent.agent_lastName,
            agent_email: agent.agent_email,
            agent_phoneNumber: agent.agent_phoneNumber,
            agent_image: agent.agent_image
        };

        // Render template with plain objects
        res.render('schedule', {
            layout: 'userMain',
            propertyDetail,
            agentDetail
        });
    } catch (err) {
        console.error('Error fetching property or agent details:', err);
        res.status(500).send({ message: 'Error fetching property or agent details', error: err });
    }
});





app.post('/schedule', async (req, res) => {
    const customerId = req.session.customerID;
    const { agentId, propertyId, appointmentDate, appointmentTime } = req.body;

    if (!customerId) {
        return res.status(400).send({ message: 'Customer not logged in' });
    }

    try {
        // Fetch customer details
        const customer = await Customer.findByPk(customerId, {
            attributes: ['Customer_fName', 'Customer_lName', 'Customer_Phone']
        });

        if (!customer) {
            return res.status(404).send({ message: 'Customer not found' });
        }

        // Fetch property details
        const property = await Listed_Properties.findByPk(propertyId, {
            attributes: ['Property_Name', 'Property_Description']
        });

        if (!property) {
            return res.status(404).send({ message: 'Property not found' });
        }

        // Create schedule
        const schedule = await Schedule.create({
            customer_id: customerId,
            agent_id: agentId,
            property_id: propertyId,
            date_selected: appointmentDate,
            time_selected: appointmentTime,
        });

        // Redirect to the customer view appointments page
        res.redirect('/customer/appointments');
    } catch (err) {
        console.error('Error inserting schedule:', err);
        res.status(400).send({ message: 'Error inserting schedule', error: err });
    }
});




app.get('/agent/appointments', async (req, res) => {
    const agentId = req.session.agentID;

    if (!agentId) {
        console.log('No agent ID found in session');
        return res.status(401).send({ message: 'Unauthorized' });
    }

    try {
        const appointments = await Schedule.findAll({
            where: { agent_id: agentId },
            include: [
                { model: Customer, attributes: ['Customer_fName', 'Customer_Email'] },
                { model: Listed_Properties, attributes: ['Property_Name', 'Property_Price', 'Property_Address'] }
            ]
        });

        // Log the fetched data to verify its structure
        console.log('Appointments:', JSON.stringify(appointments, null, 2));

        // Pass data to Handlebars view
        res.render('Property Agent/agentSchedule', { 
            agentId, 
            appointments: appointments.map(appointment => appointment.get({ plain: true })) 
        });
    } catch (err) {
        console.error('Error retrieving appointments:', err);
        res.status(500).send({ message: 'Error retrieving appointments', error: err });
    }
});


app.get('/customer/appointments', async (req, res) => {
    try {
        const customerId = req.session.customerID; 

        if (!customerId) {
            return res.status(401).send('Customer not logged in');
        }

        // Fetch customer details
        const customer = await Customer.findByPk(customerId, {
            attributes: ['Customer_fName', 'Customer_lName']
        });

        if (!customer) {
            return res.status(404).send('Customer not found');
        }

        // Fetch schedules for the customer
        const schedules = await Schedule.findAll({
            where: { customer_id: customerId },
            include: [
                { model: Agent, attributes: ['agent_firstName', 'agent_lastName', 'agent_email'] },
                { model: Listed_Properties, attributes: ['Property_Name', 'Property_Address'] }
            ]
        });

        // Log fetched data to ensure structure is correct
        console.log('Fetched Schedules:', JSON.stringify(schedules, null, 2));

        // Render the appointments view with Handlebars
        res.render('Customer/customerSchedule', {
            customerId: customerId,
            customerName: `${customer.Customer_fName} ${customer.Customer_lName}`,
            schedules: schedules.map(schedule => schedule.get({ plain: true }))
        });

    } catch (error) {
        console.error('Error fetching schedules or customer details:', error);
        res.status(500).send('Server Error');
    }
});




app.get('/schedule/:id', async (req, res) => {
    try {
        const schedule = await Schedule.findByPk(req.params.id);
        if (schedule) {
            res.json(schedule);
        } else {
            res.status(404).json({ message: 'Schedule not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching schedule', error });
    }
});

// Route to update a schedule
app.put('/schedule/:id', async (req, res) => {
    try {
        const { date_selected, time_selected } = req.body;
        const schedule = await Schedule.findByPk(req.params.id);
        if (schedule) {
            schedule.date_selected = date_selected;
            schedule.time_selected = time_selected;
            await schedule.save();
            res.status(200).json(schedule);
        } else {
            res.status(404).json({ message: 'Schedule not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating schedule', error });
    }
});

// Route to delete a schedule
app.delete('/schedule/:id', async (req, res) => {
    const scheduleId = req.params.id;

    try {
        const result = await Schedule.destroy({
            where: { schedule_id: scheduleId }
        });

        if (result) {
            res.status(200).send({ message: 'Schedule deleted successfully!' });
        } else {
            res.status(404).send({ message: 'Schedule not found.' });
        }
    } catch (err) {
        console.error('Error deleting schedule:', err);
        res.status(500).send({ message: 'Error deleting schedule.', error: err });
    }
});

// Admin User Management
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

app.get('/customers', async (req, res) => {
    try {
        const customers = await Customer.findAll();
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customers', error });
    }
});

app.get('/getCustomer/:id', async (req, res) => {
    const customerId = req.params.id;
    try {
        const customer = await Customer.findByPk(customerId);
        if (customer) {
            res.json(customer);
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching Customer details', error });
    }
});

// Admin delete customer
app.delete('/adminDeleteCustomer/:id', async (req, res) => {
    const customerId = req.params.id;
    try {
        const customer = await Customer.findByPk(customerId);
        if (customer) {
            await customer.destroy();
            res.json({ message: 'customer deleted successfully' });
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting Customer', error });
    }
});


// Admin User Management
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

app.get('/customers', async (req, res) => {
    try {
        const customers = await Customer.findAll();
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customers', error });
    }
});

app.get('/getCustomer/:id', async (req, res) => {
    const customerId = req.params.id;
    try {
        const customer = await Customer.findByPk(customerId);
        if (customer) {
            res.json(customer);
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching Customer details', error });
    }
});

// Admin delete customer
app.delete('/adminDeleteCustomer/:id', async (req, res) => {
    const customerId = req.params.id;
    try {
        const customer = await Customer.findByPk(customerId);
        if (customer) {
            await customer.destroy();
            res.json({ message: 'customer deleted successfully' });
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting Customer', error });
    }
});

// Admin Agent Management
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




app.get('/adminadvertisement', async (req, res) => {
    try {
        const advertisements = await Advertisement.findAll({
            include: [{
                model: Agent,
                as: 'agent'
            }]
        });

        const formatDate = (date) => {
            if (!date) return '';
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-based
            const year = d.getFullYear();
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        };

        const advertisementsWithParsedDescription = advertisements.map(ad => {
            try {
                const adData = ad.toJSON();
                const description = JSON.stringify(adData.description).replace(/'/g, '"') || '[]';
                const parsedDescription = JSON.parse(description);

                return {
                    ...adData,
                    description: parsedDescription,
                    date_started: formatDate(adData.date_started),
                    date_end: formatDate(adData.date_end)
                };
            } catch (error) {
                console.error('Error parsing description JSON:', error);
                return {
                    ...ad.toJSON(),
                    description: [],
                    date_started: '',
                    date_end: ''
                };
            }
        });

        res.render('Advertisements/adminadvertisement', {
            layout: 'adminMain',
            advertisements: advertisementsWithParsedDescription
        });
    } catch (error) {
        console.error('Error retrieving advertisements:', error);
        res.status(500).send('Server error');
    }
});
app.get('/adminPropertiesView', function(req, res){
    res.render('adminPropertiesView', {layout:'adminMain'});
});

app.get('/addAdvertisement', async (req, res) => {
    try {
        const agents = await Agent.findAll();

        const Agents = agents.map(agent => {
            return agent.get({ plain: true });
        });

        res.render('Advertisements/addAdvertisement', {
            layout: 'main', 
            agents: Agents
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});


app.post('/addAdvertisement', upload.single('advertisementImage'), async (req, res) => {
    try {
        const { ad_title, ad_content, agent_id, ad_description, date_started, date_end, clicks, pricePerClick } = req.body;

        const ad_image = req.file ? req.file.filename : 'placeholder.png';

        const descriptionJson = ad_description.split(',')
            .map(item => item.trim())

        // Create a new advertisement record
        const newAd = await Advertisement.create({
            ad_title,
            ad_content,
            ad_image,
            agent_id,
            description: descriptionJson,
            date_started,
            date_end,
            clicks,
            pricePerClick
        });

        // Redirect to the admin advertisements page
        res.redirect('/adminadvertisement');
    } catch (error) {
        console.error('Error adding advertisement:', error);
        res.status(500).send('Server error');
    }
});

app.get('/editAdvertisement/:ad_id', async (req, res) => {
    try {
        const ad_id = req.params.ad_id;
        const advertisement = await Advertisement.findOne({
            where: { ad_id },
            include: [{
                model: Agent,
                as: 'agent'
            }]
        });

        if (!advertisement) {
            return res.status(404).send('Advertisement not found');
        }
        const agents = await Agent.findAll();
        const adData = advertisement.toJSON();
        const description = JSON.stringify(adData.description).replace(/'/g, '"') || '[]';
        const parsedDescription = JSON.parse(description);

        res.render('editAdvertisement', {
            layout: 'main',
            advertisement: {
                ...adData,
                description: parsedDescription
            },
            agents: agents.map(agent => agent.toJSON())
        });
    } catch (error) {
        console.error('Error retrieving advertisement:', error);
        res.status(500).send('Server error');
    }
});

app.post('/editAdvertisement/:ad_id', upload.single('ad_image'), async (req, res) => {
    try {
        const ad_id = req.params.ad_id;
        const { ad_title, ad_content, agent_id, ad_description = '', date_started, date_end } = req.body;

        // Determine the image path to use
        const ad_image = req.file ? req.file.filename : req.body.existing_image;

        // Check if ad_image is defined before normalizing the path
        const normalizedAdImage = ad_image && ad_image.startsWith('../') ? ad_image.replace(/^\.\.\//, '') : ad_image;

        const descriptionJson = ad_description
            .split(',')
            .map(item => item.trim());
    
        // Find the advertisement by its ID
        const advertisement = await Advertisement.findByPk(ad_id);
    
        if (!advertisement) {
            return res.status(404).send('Advertisement not found');
        }
    
        // Update the advertisement record
        const updated = await advertisement.update({
            ad_title,
            ad_content,
            ad_image: normalizedAdImage, // Use the normalized path
            agent_id,
            description: descriptionJson,
            date_started,
            date_end
        });
    
        if (updated) {
            res.redirect('/adminadvertisement');
        } else {
            res.status(400).send('Failed to update advertisement');
        }
    } catch (error) {
        console.error('Error updating advertisement:', error);
        res.status(500).send('Server error');
    }
});



app.post('/deleteAdvertisement/:id', async (req, res) => {
    try {
        // Find the advertisement by primary key (ID)
        const advertisement = await Advertisement.findByPk(req.params.id);

        // Check if the advertisement exists
        if (advertisement) {
            // Destroy the advertisement record
            await advertisement.destroy();
            // Redirect to the advertisements page
            res.redirect('/adminadvertisement');
        } else {
            // Respond with a 404 status if not found
            res.status(404).send('Advertisement not found');
        }
    } catch (error) {
        // Handle errors and respond with a 500 status
        console.error('Error deleting advertisement:', error);
        res.status(500).send('Error deleting advertisement');
    }
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