const createError = require("http-errors");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const User = require("./models/user");

const session = require('express-session');

const express = require("express");
const bodyParser = require("body-parser");
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));
const overviewRouter = require("./routes/overview");
const financialTipsRouter = require("./routes/financialTips");
const frontpageRouter = require("./routes/frontpage");
const signUpRouter = require("./routes/signUpSide");
const logInRouter = require("./routes/logInSite");

const controller = require("./controllers/budgetController.js");



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

// Updating FIXED INCOME/EXPENSES in database

app.post("/api/update_budget", (req, res) => {
  // Get data sent from the frontend
  let data = req.body;

  let username = data.username;
  let incomeVal = data.income;
  let expenseVal = data.expenses;
  let savings = data.savings;

  // Call your controller's method
  controller
    .updateBudget(username, {
      income: incomeVal,
      expenses: expenseVal,
      savings: savings,
    })
    .then((result) => {
      // Budget update successful
      console.log("Result: \n" + result);
      res.json({ message: "Budget updated successfully: \n" + result });
    })
    .catch((err) => {
      // If anything goes wrong
      res.status(500).json({ message: "Error in updating budget." });
    });
});

// Adding custom expense to MongoDB

app.post("/api/addcustom/expense", (req, res) => {
  // Get data sent from the frontend
  let data = req.body;

  let username = data.username;
  let expenseData = {
    category: data.category,
    items: data.customExpense
  }

  // Call your controller's method
  controller
    .addCustomExpense(username, expenseData)
    .then((result) => {
      // Budget update successful
      console.log("Result: \n" + result);
      res.json({ message: "Expense added successfully: \n" + result });
    })
    .catch((err) => {
      // If anything goes wrong
      res.status(500).json({ message: "Error in adding expense." });
    });
});

// Adding custom income to MongoDB

app.post("/api/addcustom/income", (req, res) => {
  // Get data sent from the frontend
  let data = req.body;

  let username = data.username;
  let incomeData = {
    category: data.category,
    items: data.customIncome
  }

  // Call your controller's method
  controller
    .addCustomIncome(username, incomeData)
    .then((result) => {
      // Budget update successful
      console.log("Result: \n" + result);
      res.json({ message: "Income added successfully: \n" + result });
    })
    .catch((err) => {
      // If anything goes wrong
      res.status(500).json({ message: "Error in adding income." });
    });
});

// Deleting custom inputs from database
app.post("/api/deletecustom", (req,res) => {
  let data = req.body;

  let username = data.username;
  let incomeOrExpense = data.incomeOrExpense;
  let deleteData = {
    category: data.category,
    items: data.customData
  }
  controller
    .deleteCustom(username, deleteData, incomeOrExpense)
    .then((result) => {
      // Budget update successful
      console.log("Budget update successful....Result: \n" + result);
      res.json({ message: "Custom data deleted successfully: \n" + result });
    })
    .catch((error) => {
      // If anything goes wrong
      res.status(500).json({ message: "Error deleting custom income/expense.", error });
    });
});


//###########################
// READING DATA FROM MONGO-DB
//###########################
// Defining our GET endpoint --- Define route to fetch data for a specific user
app.get('/api/budget/:budgetID', async (req, res) => {
  try {
      // Query MongoDB to retrieve data for the specific user
      let username = req.session.username;                                    //RET TIL BRUG AF RIGTIGT USERNAME
      const id = await controller.fetchUserBudgetId(username);                // Using function from budgetcontroller.js to find user's id
      const data = await controller.Budget.findOne({ _id: id });              // Using user id to find their budget 
      if (!data) {
          return res.status(404).json({ message: "Data not found for the specified user" });      // Error if file contains no data (!data)
      }
      res.json(data); // If file contains data, respond with that data
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
});


app.post('/login', async (req, res) => {
  let data = req.body;
  let username = data.username;
  let password = data.password;
  try {
    await controller.findUserByUsernameAndPassword(username.toLowerCase(), password);
    req.session.username = username.toLowerCase();
    res.redirect('/overview'); // Redirect to the overview page if user login is successful

  } catch (error) {
    if (error.message === 'User not found or password incorrect') {
      // Render a view with a retry option and an error alert
      res.render('logInSite', { 
        error: 'User dont exists. Please choose a different username.', 
        retryUrl: '/logIn',
        alert: 'Error: Password or Username is incorrect'
      });
    } else {
      // Handle other errors
      console.error(error);
      res.status(500).send('An error occurred during the log in process.');
    }
  }
});




// Route to handle POST request from the signup form
app.post('/signup', async (req, res) => {
  let data = req.body;
  let username = data.username;
  let password = data.password;

  try {
    await controller.createUserWithBudget(String(username), String(password));
    req.session.username = username.toLowerCase();
    res.redirect('/overview'); // Redirect to the overview page if user creation is successful
    
  } catch (error) {
    if (error.message === 'User already exists') {
      // Render a view with a retry option and an error alert
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

app.get('/api/customexpenses/:month/:year', async (req, res) => {
  try {
    const username = req.session.username;
    const { month, year } = req.params;
    const expenses = await controller.fetchCustomExpensesByMonthAndYear(username, month, year);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/monthlybudget/:month/:year', async (req, res) => {
  try {
    const username = req.session.username;
    const { month, year } = req.params;
    const monthlyBudget = await controller.getMonthlyBudget(username, parseInt(month), parseInt(year));
    res.json(monthlyBudget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/update_monthly_budget', async (req, res) => {
  try {
    const username = req.session.username;
    const { month, year, income, expenses, savings } = req.body;
    await controller.updateMonthlyBudget(username, parseInt(month), parseInt(year), { income, expenses, savings });
    res.json({ message: 'Monthly budget updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");   // Set pug as the view engine


// Middleware setup
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));


// Routes setup
app.use("/", frontpageRouter);
app.use("/overview", overviewRouter);
app.use("/financialTips", financialTipsRouter);
app.use("/signup", signUpRouter);
app.use("/login", logInRouter);


// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});


// Error handler
app.use(function (err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
