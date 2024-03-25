// Import/require important liberayes
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// Connect to your MongoDB Atlas database
mongoose.connect('mongodb+srv://gruppe4:abe54321@budget.lgi0q5b.mongodb.net/budget_database?retryWrites=true&w=majority&appName=Budget');

const BudgetSchema = new Schema({
  income: { type: Number, required: true },
  expenses: { type: Number, required: true },
  goal: { type: Number, required: true },
});

// Export model
module.exports = mongoose.model("Budget", BudgetSchema);



