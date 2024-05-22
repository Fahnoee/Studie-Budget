const createError = require("http-errors");   // Express standard requires
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const session = require('express-session');   // Including express session library

const express = require("express");
const bodyParser = require("body-parser");    //Module for converting JSON formatted packages
require('dotenv').config();                   // dotenv module for saving mongodb connection string outside of codebase

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({                       // express-session setup with dotenv saved passkey
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

const overviewRouter = require("./routes/overview");  //Include routes for directing
const financialTipsRouter = require("./routes/financialTips");
const frontpageRouter = require("./routes/frontpage");
const signUpRouter = require("./routes/signUpSide");
const logInRouter = require("./routes/logInSite");
const helpSiteRouter = require("./routes/helpSite");
const settingRouter = require("./routes/settingSite");

const controller = require("./controllers/budgetController.js");  //Controller (functions) for handling packages

//###########################
// Set up mongoose connection
//###########################
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGODB_URI;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

//############################ 
// UPDATING DATA IN MONGODB 
//############################ 
app.post("/api/addcustom/expense", (req, res) => {  //Add an expense in
  let data = req.body;                     // Get data sent from the frontend

  let username = data.username;
  
  let expenseData = {                       // Pack data for controller
    category: data.category,
    items: data.customExpense
  }
  let newName = data.newName;

  controller                                 // Call to controller's method
    .addCustomExpense(username, expenseData, newName)
    .then((result) => {                      // Budget update successful handling
      console.log("Result: \n" + result);
      res.json({ message: "Expense added successfully: \n" + result });
    })
    .catch((err) => {                        //Catch potential errors
      res.status(500).json({ message: "Error in adding expense:", err });
    });
});

// Adding custom income to MongoDB

app.post("/api/addcustom/income", (req, res) => {
  let data = req.body;
  let username = data.username;

  let incomeData = {
    category: data.category,
    items: data.customIncome
  }

  controller
    .addCustomIncome(username, incomeData)
    .then((result) => {
      console.log("Result: \n" + result);
      res.json({ message: "Income added successfully: \n" + result });
    })
    .catch((err) => {
      res.status(500).json({ message: "Error in adding income." });
    });
});

app.post("/api/deletecustom", (req,res) => {  // Deleting custom inputs from database
  let data = req.body;

  let username = data.username;
  let deleteData = {
    category: data.category,
    items: data.customData
  }
  controller
    .deleteCustom(username, deleteData)
    .then((result) => {
      console.log("Budget update successful....Result: \n" + result);
      res.json({ message: "Custom data deleted successfully: \n" + result });
    })
    .catch((error) => {
      res.status(500).json({ message: "Error deleting custom income/expense.", error });
    });
});

app.post("/api/deletecategory", (req,res) => {  // Deleting categories from database
  let data = req.body;

  let username = data.username;
  let categoryName = data.category;
  controller
    .deleteCategory(username, categoryName)
    .then((result) => {
      console.log("Budget update successful....Result: \n" + result);
      res.json({ message: "Category deleted successfully: \n" + result });
    })
    .catch((error) => {
      res.status(500).json({ message: "Error deleting category.", error });
    });
});

app.post("/api/deleteuser", (req,res) => {  //Delete user from database
  let data = req.body;
  controller
    .deleteUser(data.username)
    .then((result) => {
      console.log("User deleted successfully: \n" + result);
      res.json({ message: "User deleted successfully: \n" + result });
    })
    .catch((error) => {
      res.status(500).json({ message: "Error deleting user.", error });
    });
});

app.post("/api/logout", (req,res) => {

  req.session.username = undefined;
  res.json({ message: "User logged out successfully: \n" + result });
});

//###########################
// READING DATA FROM MONGO-DB
//###########################
app.get('/api/budget/:budgetID', async (req, res) => {             //Fetches budgetID from the database
  try {
      let username = req.session.username;                         // Query MongoDB to retrieve data for the specific user
      const id = await controller.fetchUserBudgetId(username);     // Using function from budgetcontroller.js to find user's id
      const data = await controller.Budget.findOne({ _id: id });   // Using budget id to find their budget 
      if (!data) {                                                 // If file contains data, respond with 404 message
          return res.status(404).json({ message: "Data not found for the specified user" });
      }
      res.json(data);                                              // If file contains data, respond with that data
  } catch (err) {
      res.status(500).send('Internal Server Error:', err);
  }
});

app.post('/login', async (req, res) => {  //Logs a user in
  let data = req.body;
  let username = data.username;
  let password = data.password;
  try {
    await controller.findUserByUsernameAndPassword(username.toLowerCase(), password); // Tries to find the user
    req.session.username = username.toLowerCase();
    res.redirect('/overview');                                                        // Redirect to the overview page if user login is successful

  } catch (error) {
    if (error.message == 'Error finding user: User not found or password incorrect') {// Render a view with a retry option and an error alert
      res.render('logInSite', { 
        error: 'Login is invalid, please try again.', 
        retryUrl: '/logIn',
        alert: 'Error: Password or Username is incorrect'                             // Error message passed to view for display on site.
      });
    } else {                                                                          // Handle other errors
      console.error(error);
      res.status(500).send('An error occurred during the log in process.');
    }
  }
});

app.post('/signup', async (req, res) => { //Sign up
  let data = req.body;
  let username = data.username;
  let password = data.password;

  try {
    await controller.createUserWithBudget(String(username), String(password));  //Controller function that creates new user
    req.session.username = username.toLowerCase();                              //Username to lowercase
    res.redirect('/overview?startTutorial=true');                               // When SignUp successful, redirect to overview page and start tutorial
    
  } catch (error) {
    if (error.message === 'User already exists') {                              // Render a view with a retry option and an error alert
      res.render('signUpSide', { 
        error: 'User already exists. Please choose a different username.', 
        retryUrl: '/signup',
        alert: 'Error: User already exists. Try a different username.'
      });
    } else {
                                                                                // Handle other errors
      console.error(error);
      res.status(500).send('An error occurred during the signup process.');
    }
  }
});

app.get('/api/customexpenses/:month/:year', async (req, res) => { // Calculate expenses for a given month/year
  try {
    const username = req.session.username;
    const { month, year } = req.params;                                                           //Takes parameters from the api-endpoint
    const expenses = await controller.fetchCustomExpensesByMonthAndYear(username, month, year);
    res.json(expenses);                                                                            //If successful, respond with expenses for given month/year
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/customeincomes/:month/:year', async (req, res) => { // Calculate incomes for a given month/year
  try {
    const username = req.session.username;
    const { month, year } = req.params;
    const incomes = await controller.fetchCustomIncomesByMonthAndYear(username, month, year);
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/monthlybudget/:month/:year', async (req, res) => { // Calculates a collected budget for a given month
  try {
    const username = req.session.username;
    const { month, year } = req.params;
    const monthlyBudget = await controller.getMonthlyBudget(username, parseInt(month), parseInt(year)); // parseInt to convert strings to integers
    res.json(monthlyBudget);                                                                            // If successful, respond with the budget for that month and year
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/update_monthly_budget', async (req, res) => { // Alters a budget from a given month
  try {
    const username = req.session.username;
    const { month, year, income, expenses, savings } = req.body;
    await controller.updateMonthlyBudget(username, parseInt(month), parseInt(year), { income, expenses, savings });
    res.json({ message: 'Monthly budget updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.set("views", path.join(__dirname, "views"));  // Pug view engine setup
app.set("view engine", "pug");

app.use(logger("dev"));    // Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", frontpageRouter);  // Routes setup
app.use("/overview", overviewRouter);
app.use("/financialTips", financialTipsRouter);
app.use("/signup", signUpRouter);
app.use("/login", logInRouter);
app.use("/Help", helpSiteRouter);
app.use("/Settings", settingRouter);

app.use(function (req, res, next) { // Catch 404 and forward to error handler
  next(createError(404));
});

app.use(function (err, req, res, next) {  // Error handler
  res.locals.message = err.message;      // Set locals, only providing error in development
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);    // Render the error page
  res.render("error");
});

module.exports = app;