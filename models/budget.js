// Import/require important liberayes
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BudgetSchema = new Schema({
  monthlyRecords: [{
    month: { type: String, required: true },
    year: { type: String, required: true },
    income: { type: Number, required: true },
    expenses: { type: Number, required: true },
    savings: { type: Number, required: true },
    customExpenses: { type: mongoose.Schema.Types.Mixed, default: {} },
    customIncomes: { type: mongoose.Schema.Types.Mixed, default: {} }
  }]
});

// Export model
module.exports = mongoose.model("Budget", BudgetSchema);
