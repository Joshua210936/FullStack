// app.get('/customer', function (req, res) {
//     // if (!req.session.user) {
//     //     console.log('User not logged in');
//     //     return res.redirect('/login');
//     // }

//     res.render('customerHome', { user: req.session.user, layout: 'userMain' });
// });






// app.post('/register', async function (req, res) {
//     let errorsList = [];
//     let { firstName, lastName, phoneNumber, email, birthday, password, confirmPassword } = req.body;
//     if (!email) {
//         return res.status(400).send("One or more required payloads were not provided.")

//     }

//     const data = await Customer.findAll({
//         attributes: ["Customer_Email"]
//     });
//     console.log(data);
//     // Check if password and confirmPassword match
//     if (password !== confirmPassword) {
//         errorsList.push({ text: 'Passwords do not match' });
//         return res.status(400).send({ message: 'Passwords do not match' });
//     }

//     // Check if email already exists
//     var exists = false;
//     for (var cust of data) {
//         if (cust.toJSON().Customer_Email == email) {
//             // return res.status(400).send("Email already exists.")
//             errorsList.push({ text: 'Email already exists' });
            
//         }
//     }

//     // Check if phone number is valid
//     const phoneNumberPattern = /^[89]\d{7}$/;
//     if (!phoneNumberPattern.test(phoneNumber)) {
//         errorsList.push({ message: 'Phone number must be 8 digits and start with 8 or 9' });
//     }

//     // Check if password is valid
//     const passwordPattern = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
//     if (!passwordPattern.test(password)) {
//         errorsList.push({ message: 'Password must be at least 8 characters long, include at least one capital letter, and one number' });
//     }

//     if (errorsList.length > 0) {
//         let msg_error = "";
//         for (let i = 0; i < errorsList.length; i++) {
//             console.log(errorsList[i]);
//             msg_error += errorsList[i].text + "\n";
//         }

//         res.render('Login/userReg',{layout:'main', error_msg:msg_error});
//     } else {
//         // Create new customer
//         Customer.create({
//             Customer_fName: firstName,
//             Customer_lName: lastName,
//             Customer_Phone: phoneNumber,
//             Customer_Email: email,
//             Customer_Birthday: birthday,
//             Customer_Password: password,
//         })
//             .then(user => {
//                 // Redirect to login page
//                 res.redirect('/login');
//             })
//             .catch(err => {
//                 res.status(400).send({ message: 'Error registering user', error: err });
//             });
//     }
// });






// app.get('/userSetProfile/:customer_id', async (req, res) => {
//     // const customer_id = req.params.customer_id;
//     const customer_id = 1;
//     console.log('Customer ID:', customer_id);
//     try {
//         const customer = await Customer.findByPk(customer_id);
//         if (customer) {
//             res.render('Customer/userSetProfile', { 
//                 layout: 'userMain', 
//                 customer_id: customer_id,
//                 customer: customer.get({ plain: true })
//             });
//         } else {
//             res.status(404).json({ message: 'Customer not found' });
//         }
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching customer details', error });
//     }
// });






// app.post('/userSetProfile/:customer_id', async (req, res) => {
//     const { firstName, lastName, phoneNumber, birthday } = req.body;
//     const customer_id = req.params.customer_id;
    
//     console.log('Received customer ID:', customer_id); // Log customer ID
//     console.log('Received update data:', { firstName, lastName, phoneNumber, birthday }); // Log update data
    
//     try {
//         const customer = await Customer.findByPk(customer_id);
//         if (customer) {
//             await Customer.update(
//                 {
//                     Customer_fName: firstName,
//                     Customer_lName: lastName,
//                     Customer_Phone: phoneNumber,
//                     Customer_Birthday: birthday,
//                 },
//                 {
//                     where: {
//                         Customer_id: customer_id
//                     }
//                 }
//             );
//             res.redirect(`/userSetProfile/${customer_id}`);
//         } else {
//             res.status(404).send("Customer not found");
//         }
//     } catch (err) {
//         console.error(err);
//         res.status(500).send("Error updating customer profile");
//     }
// });




// Not needed
// // GET route to retrieve the first customer profile
// app.get('/userSetProfile', async (req, res) => {
//     try {
//         // Find the first customer
//         const customer = await Customer.findOne({ order: [['Customer_id', 'ASC']] });
//         if (customer) {
//             res.render('Customer/userSetProfile', { 
//                 layout: 'userMain', 
//                 customer_id: customer.Customer_id,
//                 customer: customer.get({ plain: true })
//             });
//         } else {
//             res.status(404).json({ message: 'Customer not found' });
//         }
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching customer details', error });
//     }
// });

// // POST route to update the customer profile by customer_id
// app.post('/userSetProfile/:customer_id', async (req, res) => {
//     const { firstName, lastName, phoneNumber, birthday } = req.body;
//     const customer_id = req.params.customer_id; // Retrieve the customer_id from the URL
    
//     try {
//         // Find the customer by ID
//         const customer = await Customer.findByPk(customer_id);
//         if (customer) {
//             await Customer.update(
//                 {
//                     Customer_fName: firstName,
//                     Customer_lName: lastName,
//                     Customer_Phone: phoneNumber,
//                     Customer_Birthday: birthday,
//                 },
//                 {
//                     where: {
//                         Customer_id: customer_id
//                     }
//                 }
//             );
//             res.redirect(`/userSetProfile/${customer_id}`);
//         } else {
//             res.status(404).send("Customer not found");
//         }
//     } catch (err) {
//         console.error(err);
//         res.status(500).send("Error updating customer profile");
//     }
// });