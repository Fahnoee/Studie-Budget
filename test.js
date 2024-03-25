const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Connect to your MongoDB Atlas database
mongoose.connect('mongodb+srv://gruppe4:abe54321@budget.lgi0q5b.mongodb.net/budget_database?retryWrites=true&w=majority&appName=Budget', {useNewUrlParser: true, useUnifiedTopology: true});

const BudgetSchema = new Schema({
  income: { type: Number, required: true },
  expenses: { type: Number, required: true },
  goal: { type: Number, required: true },
});
const Budget = mongoose.model('Budget', BudgetSchema);

const UserSchema = new Schema({
  name: { type: String, required: true },
  budget: { type: Schema.Types.ObjectId, ref: 'Budget' }
});
const User = mongoose.model('User', UserSchema);

// // Test the schema by creating a new budget and user
// (async () => {
//   // Create a new budget
//   const budget = new Budget({
//     income: 2000,
//     expenses: 1000,
//     goal: 200
//   });
  
//   await budget.save();
  

//   // // Create a new user with a reference to the budget just created
//   // const user = new User({
//   //   name: 'John Doe',
//   //   budget: budget._id
//   // });

//   // await user.save();
  
//   // Fetch the user along with their budget
//   const fetchedUser = await User
//     .findOne({ name: 'John Doe' })
//     .populate('budget');
    
//   console.log('Fetched user:', fetchedUser);
// })();
 
async function fetchUserBudgetId() {
  try {const userId = await User.findOne({ name: 'John Doe' })
    return userId.budget;
      } catch(error){
        console.log('Error finding UserID:', error);
    }
};
  

async function updateBudget(newData) {
    try {
      const budgetId = await fetchUserBudgetId();  
      const updatedBudget = await Budget.findByIdAndUpdate(budgetId, newData, { new: true });
      console.log('Updated budget:', updatedBudget);
      return updatedBudget;
    } catch (error) {
      console.log('Error updating budget:', error);
    }
}
  
// Use the function
updateBudget({
  income: 500, 
  expenses: 800, 
  goal: 200
});
  
  