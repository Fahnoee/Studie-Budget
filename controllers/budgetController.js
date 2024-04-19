const User = require("../models/user.js")
const Budget = require("../models/budget.js")

/**
 * Fetches the budget ID associated with a given username.
 * @async
 * @param {string} username - The username to search for in the database.
 * @returns {Promise<string>} A promise that resolves with the budget ID associated with the user.
 * @throws {Error} If no user is found or if there's an error during the query execution.
 */
async function fetchUserBudgetId(username) {
    try {
        // Attempt to find a user by their username
        const user = await User.findOne({ name: username }).exec();
        if (!user) {
            // If no user is found, throw an error
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
 * @async
 * @param {string} username - The username of the user whose budget is to be updated.
 * @param {Object} newData - The new data to update the budget with.
 * @returns {Promise<Object>} A promise that resolves with the updated budget document.
 * @throws {TypeError} If newData is not an object or is null.
 * @throws {Error} If no budget is found for the user or if the update operation fails.
 */
async function updateBudget(username, newData) {
    if (!newData || typeof newData !== 'object') {
        // Validate newData is a non-null object
        throw new TypeError('newData must be a non-null object');
    }
    try {
        const budgetId = await fetchUserBudgetId(username);
        if (!budgetId) {
            // If no budget ID is found, throw an error
            throw new Error(`No budget found for user ${username}`);
        }
        const updatedBudget = await Budget.findByIdAndUpdate(budgetId, newData, { new: true }).exec();
        if (!updatedBudget) {
            // If the update operation does not return a document, throw an error
            throw new Error('Budget update failed');
        }
        // Return the updated budget document
        return updatedBudget;
    } catch (error) {
        // Catch and re-throw any errors encountered during the update operation
        throw new Error(`Problem updating budget for ${username}: ${error.message}`);
    }
};

/**
 * Creates a new user with a default budget.
 * @async
 * @param {string} username - The username for the new user.
 * @param {string} password - The password for the new user.
 * @returns {Promise<Object>} A promise that resolves with the newly created user document.
 * @throws {Error} If the user already exists or if there's an error during user creation.
 */
async function createUserWithBudget(username, password) {
    username = username.toLowerCase(); // Normalize username to lowercase

    const existingUser = await User.findOne({ name: username }).exec();
    if (existingUser) {
        // Check if user already exists
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

/**
 * Adds custom expense items under a specific category for a user's budget.
 * @async
 * @param {string} username - The username of the user.
 * @param {{category: string, items: Array}} param1 - The category and items to add.
 * @returns {Promise<Object>} A promise that resolves with the updated budget document.
 * @throws {Error} If no budget is found for the user or if the update operation fails.
 */
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

/**
 * Adds custom income items under a specific category for a user's budget.
 * @async
 * @param {string} username - The username of the user.
 * @param {{category: string, items: Array}} param1 - The category and items to add.
 * @returns {Promise<Object>} A promise that resolves with the updated budget document.
 * @throws {Error} If no budget is found for the user or if the update operation fails.
 */
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

/**
 * Finds a user by their username and password.
 * @async
 * @param {string} username - The username of the user to find.
 * @param {string} password - The password of the user to authenticate.
 * @returns {Promise<Object>} A promise that resolves with the user document if found and authenticated.
 * @throws {Error} If the user is not found or the password is incorrect.
 */
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

/**
 * Deletes a user and their associated budget from the database.
 * @async
 * @param {string} username - The username of the user to delete.
 * @throws {Error} If the user is not found or if there's an error during the deletion process.
 */
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
    findUserByUsernameAndPassword: findUserByUsernameAndPassword,
};
// At the end of the file, add a call to fetchCategoryExpensesAndGoals for testing purposes
