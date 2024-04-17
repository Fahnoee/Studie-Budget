const User = require("../models/user.js")
const Budget = require("../models/budget.js")


/**
 * Fetches the budget ID associated with a given username.con
 * @param {string} username - The username to search for in the database.
 * @returns {Promise<string>} The budget ID associated with the user.
 * @throws {Error} If no user is found or if there's an error during the query execution.
 */
async function fetchUserBudgetId(username) {
    try {
        // Attempt to find a user by their username
        const user = await User.findOne({ name: username }).exec();
        // If no user is found, throw an error
        if (!user) {
            throw new Error(`No user found with name ${username}`);
        }
        // Return the user's budget ID
        return user.budget;
    } catch (error) {
        // Catch and re-throw any errors encountered during the operation
        throw new Error(`Error finding UserID for ${username}: ${error.message}`);
    }
}

/**
 * Updates the budget for a given user.
 * @param {string} username - The username of the user whose budget is to be updated.
 * @param {Object} newData - The new data to update the budget with.
 * @returns {Promise<Object>} The updated budget document.
 * @throws {TypeError} If newData is not an object or is null.
 * @throws {Error} If no budget is found for the user or if the update operation fails.
 */
async function updateBudget(username, newData) {
    // Validate newData is a non-null object
    if (!newData || typeof newData !== 'object') {
        throw new TypeError('newData must be a non-null object');
    }
    try {
        // Fetch the budget ID for the given username
        const budgetId = await fetchUserBudgetId(username);
        // If no budget ID is found, throw an error
        if (!budgetId) {
            throw new Error(`No budget found for user ${username}`);
        }
        // Attempt to update the budget with the new data
        const updatedBudget = await Budget.findByIdAndUpdate(budgetId, newData, { new: true }).exec();
        
        // If the update operation does not return a document, throw an error
        if (!updatedBudget) {
            throw new Error('Budget update failed');
        }
        // Return the updated budget document
        return updatedBudget;
    } catch (error) {
        // Catch and re-throw any errors encountered during the update operation
        throw new Error(`Problem updating budget for ${username}: ${error.message}`);
    }
};

async function createUserWithBudget(username, password) {
    // Check if user already exists
    username = username.toLowerCase();

    const existingUser = await User.findOne({ name: username }).exec();
    if (existingUser) {
        throw new Error('User already exists');
    }

    // Set default values for the budget
    const defaultBudget = {
        income: 0,
        expenses: 0,
        goal: 0,
        customExpenses: {},
        customIncome: {}
    };

    try {
        const newBudget = await Budget.create(defaultBudget);
        const newUser = await User.create({ name: username, password: password, budget: newBudget._id });
        return newUser;
    } catch (error) {
        throw new Error(`Error creating user with budget: ${error.message}`);
    }
}



async function addCustomExpense(username, { category, items }) {
    try {
        const budgetId = await fetchUserBudgetId(username);
        if (!budgetId) {
            throw new Error(`No budget found for user ${username}`);
        }
        const budget = await Budget.findById(budgetId);
        if (!budget) {
            throw new Error('Budget not found');
        }
        if (!budget.customExpenses) {
            budget.customExpenses = {}; // Initialize if null
        }
        // Initialize the category if it doesn't exist
        if (!budget.customExpenses[category]) {
            budget.customExpenses[category] = [];
            items.forEach(item => budget.customExpenses[category].push(item));
            // Mark the customExpenses field as modified
            budget.markModified('customExpenses');
        }
        // Add the new items to the category
        else {
            items.forEach(item => budget.customExpenses[category].push(item));
            // Mark the customExpenses field as modified
            budget.markModified('customExpenses');
        }
        // Save the updated budget
        const updatedBudget = await budget.save();
        return updatedBudget;
    } catch (error) {
        throw new Error(`Problem adding custom expense for ${username}: ${error.message}`);
    }
}

async function addCustomIncome(username, { category, items }) {
    try {
        const budgetId = await fetchUserBudgetId(username);
        if (!budgetId) {
            throw new Error(`No budget found for user ${username}`);
        }
        const budget = await Budget.findById(budgetId);
        if (!budget) {
            throw new Error('Budget not found');
        }
        if (!budget.customIncomes) {
            budget.customIncomes = {}; // Initialize if null
        }
        // Initialize the category if it doesn't exist
        if (!budget.customIncomes[category]) {
            budget.customIncomes[category] = [];
        }
        // Add the new items to the category
        items.forEach(item => budget.customIncomes[category].push(item));
        // Mark the customIncomes field as modified
        budget.markModified('customIncomes');
        // Save the updated budget
        const updatedBudget = await budget.save();
        return updatedBudget;
    } catch (error) {
        throw new Error(`Problem adding custom income for ${username}: ${error.message}`);
    }
}

async function findUserByUsernameAndPassword(username, password) {
    try {
        const user = await User.findOne({ name: username, password: password });
        if (!user) {
            throw new Error('User not found or password incorrect');
        }
        return user;
    } catch (error) {
        throw new Error(`Error finding user: ${error.message}`);
    }
}


async function deleteUser(username) {
    try {
        // Find the user by username
        const user = await User.findOne({ name: username });
        if (!user) {
            throw new Error(`User ${username} not found`);
        }
        // Delete the associated budget
        await Budget.findByIdAndDelete(user.budget);
        // Delete the user
        await User.findByIdAndDelete(user._id);
        console.log(`User ${username} and associated budget deleted successfully`);
    } catch (error) {
        throw new Error(`Error deleting user ${username}: ${error.message}`);
    }
}

//add customexpenses food catagory pizza for 10
//addCustomIncome("sidste", { category: "race", items: [{name: "pizza", amount: 10}] })
//createUserWithBudget("user", "password");
//addCustomIncome("sidste", { category: "Race", items: [{name: "Somali pirate", amount: 10}] })

// Placeholder variables for budget data
let income; 
let expenses;
let goal;

// Example usage of the updateBudget function
// updateBudget(username, {
//     income: income,
//     expenses: expenses,
//     goal: goal
// });

// Exporting functions and models for external use
module.exports = {
    User: User,
    Budget: Budget,
    fetchUserBudgetId: fetchUserBudgetId,
    updateBudget: updateBudget,
    createUserWithBudget: createUserWithBudget,
    addCustomExpense: addCustomExpense,
    addCustomIncome: addCustomIncome,
    deleteUser: deleteUser,
    findUserByUsernameAndPassword: findUserByUsernameAndPassword
};
