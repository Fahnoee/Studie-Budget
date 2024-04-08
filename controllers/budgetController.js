
const User = require("../models/user.js")
const Budget = require("../models/budget.js")

//laver en variable til at teste med.
let username;
username = "John Doe";

async function fetchUserBudgetId(username) {
    try {
        const userId = await User.findOne({ name: username })
        return userId.budget;
    } catch (error) {
        console.log('Error finding UserID:', error);
    }
};

// Remember to make error handling for non numbers
async function updateBudget(username, newData) {
    try {
        const budgetId = await fetchUserBudgetId(username);
        const updatedBudget = await Budget.findByIdAndUpdate(budgetId, newData, { new: true });
        console.log('Updated budget:', updatedBudget);
        return updatedBudget;
    } catch (error) {
        console.log('Error updating budget:', error);
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

