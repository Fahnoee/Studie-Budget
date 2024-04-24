// Import/require important liberayes
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MonthlyRecordSchema = new Schema({
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  income: { type: Number, default: 0 },
  expenses: { type: Number, default: 0 },
  savings: { type: Number, default: 0 }
}, { _id: false });

const BudgetSchema = new Schema({
  monthlyRecords: [MonthlyRecordSchema],
  customExpenses: { type: mongoose.Schema.Types.Mixed, default: {} },
  customIncomes: { type: mongoose.Schema.Types.Mixed, default: {} }
});

// Export model
module.exports = mongoose.model("Budget", BudgetSchema);
