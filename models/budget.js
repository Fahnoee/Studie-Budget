// Import/require important liberayes
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BudgetSchema = new Schema({
  income: { type: Number, required: true },
  expenses: { type: Number, required: true },
  goal: { type: Number, required: true },
});

// Export model
module.exports = mongoose.model("Budget", BudgetSchema);



