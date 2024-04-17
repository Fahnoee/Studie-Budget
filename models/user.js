// import/require important liberys
const mongoose = require('mongoose');

//sets a mongoose schema
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  budget: { type: Schema.Types.ObjectId, ref: 'Budget' }
});


// Export model
module.exports = mongoose.model("User", UserSchema);