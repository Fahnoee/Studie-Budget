const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BudgetSchema = new Schema({
  income: { type: float, required: true },
  expenses: { type: float, required: true },
  goal: { type: float, required: true },
});

// Virtual for book's URL
BudgetSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/budget/${this._id}`;
});

// Export model
module.exports = mongoose.model("Budget", BudgetSchema);
