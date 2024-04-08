const createError = require("http-errors");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const overviewRouter = require("./routes/overview");
const adviceRouter = require("./routes/advice");
const frontpageRouter = require("./routes/frontpage");

const controller = require("./controllers/budgetController.js");

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

//############################ 
// UPDATING DATA IN MONGODB 
//############################ 

app.post("/api/update_budget", (req, res) => {
  // Get data sent from the frontend
  let data = req.body;

  let username = data.username;
  let incomeVal = data.income;
  let expenseVal = data.expenses;
  let goal = data.goal;

  // Call your controller's method
  controller
    .updateBudget(username, {
      income: incomeVal,
      expenses: expenseVal,
      goal: goal,
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


//###########################
// READING DATA FROM MONGO-DB
//###########################
// Defining our GET endpoint --- Define route to fetch data for a specific user
app.get('/api/budget/:budgetID', async (req, res) => {
  try {
      // Query MongoDB to retrieve data for the specific user
      let username = "John Doe"                                    //RET TIL BRUG AF RIGTIGT USERNAME
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


//###########################
// Set up mongoose connection
//###########################
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const mongoDB =
  "mongodb+srv://gruppe4:abe54321@budget.lgi0q5b.mongodb.net/budget_database?retryWrites=true&w=majority&appName=Budget";

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}


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
app.use("/advice", adviceRouter);


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
