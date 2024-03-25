// import/require important liberys
const mongoose = require('mongoose');

//sets a mongoose schema
const Schema = mongoose.Schema;

// Connect to your MongoDB Atlas database
mongoose.connect('mongodb+srv://gruppe4:abe54321@budget.lgi0q5b.mongodb.net/budget_database?retryWrites=true&w=majority&appName=Budget');

const UserSchema = new Schema({
  name: { type: String, required: true },
  budget: { type: Schema.Types.ObjectId, ref: 'Budget' }
});


// Export model
module.exports = mongoose.model("User", UserSchema);




