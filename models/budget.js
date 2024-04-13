// Import/require important liberayes
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BudgetSchema = new Schema({
  income: { type: Number, required: true },
  expenses: { type: Number, required: true },
  goal: { type: Number, required: true },
  customExpenses: { type: mongoose.Schema.Types.Mixed, default: {} }, // Updated line
});

// Export model
module.exports = mongoose.model("Budget", BudgetSchema);



