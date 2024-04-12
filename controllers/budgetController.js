
const User = require("../models/user.js")
const Budget = require("../models/budget.js")

// Createss a variable for testing
let username;
username = "John Doe";



async function fetchUserBudgetId(username) {
    try {
        const user = await User.findOne({ name: username });                // returns null if no username found in database
        if (!user) throw new Error(`No user found with name ${username}`);  // if no user found, throws error
        return user.budget;
        
    } catch (error) {
        console.error('Error finding UserID:', error);
        throw error;
    }
}


// Remember to make error handling for non numbers
async function updateBudget(username, newData) {
    try {
        const budgetId = await fetchUserBudgetId(username);     // throws error if no username found in database
        // throws error if no cennection found (or if no match, but should not happen due to line above)
        const updatedBudget = await Budget.findByIdAndUpdate(budgetId, newData, { new: true });
        
        return updatedBudget;

    } catch (error) {
        console.log('Error updating budget:', error);
        throw new Error('Problem updating budget');
    }
};

let income;
let expenses;
let goal;

// Use the function
updateBudget(username, {
    income: income,
    expenses: expenses,
    goal: goal
});

module.exports = {
    User: User,
    Budget: Budget,
    fetchUserBudgetId: fetchUserBudgetId,
    updateBudget: updateBudget
};

