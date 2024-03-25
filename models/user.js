const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    budget: { type: Schema.Types.ObjectId, ref: 'Budget' }
  });
  
module.exports = mongoose.model("User", UserSchema);
  

// Virtual for author's URL
UserSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/user/${this._id}`;
});


// Export model
module.exports = mongoose.model("User", UserSchema);




