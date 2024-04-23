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

    // Get current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
    const currentYear = currentDate.getFullYear();

    // Set default values for the budget, including an initial monthly record
    const defaultBudget = {
        income: 0,
        expenses: 0,
        savings: 0,
        customExpenses: {},
        customIncome: {},
        monthlyRecords: [{
            month: currentMonth,
            year: currentYear,
            income: 0,
            expenses: 0,
            savings: 0
        }]
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
            console.log("TEST ##1");
            budget.customExpenses[category] = [];
            items.forEach(item => budget.customExpenses[category].push(item));
            // Mark the customExpenses field as modified
            budget.markModified('customExpenses');
        }
        else if (budget.customExpenses[category][0].name === "##GOAL##" && items[0].name === "##GOAL##") {
            budget.customExpenses[category][0] = items[0];
            budget.markModified('customExpenses');
        }
        // Add the new items to the category
        else {
            console.log("TEST ##3");
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


// Example usage of the updateBudget function
// updateBudget(username, {
//     income: income,
//     expenses: expenses,
//     goal: goal
// });

async function fetchCustomExpensesByMonthAndYear(username, month, year) {
    try {
        const budgetId = await fetchUserBudgetId(username);
        const budget = await Budget.findById(budgetId);

        const filteredExpenses = {};
        for (const category in budget.customExpenses) {
            filteredExpenses[category] = budget.customExpenses[category].filter(item => {
                if (item.name === "##GOAL##") {
                    return true; // Always include the goal item
                } else if (item.date) {
                    const [itemDate, itemTime] = item.date.split(' ');
                    const [itemYear, itemMonth] = itemDate.split('-').map(val => parseInt(val, 10));
                    const parsedYear = parseInt(year, 10);
                    const parsedMonth = parseInt(month, 10);
                    return itemYear === parsedYear && itemMonth === parsedMonth;
                }
                return false;
            });
        }


        return filteredExpenses;
    } catch (error) {
        throw new Error(`Problem fetching custom expenses for ${username}: ${error.message}`);
    }
}
// Exporting functions and models for external use

// At the end of the file, add a call to fetchCategoryExpensesAndGoals for testing purposes

async function deleteCustom(username, { category, items }, incomeOrExpense){

    try {
        const budgetId = await fetchUserBudgetId(username);
        if (!budgetId) {
            throw new Error(`No budget found for user ${username}`);
        }
        const budget = await Budget.findById(budgetId);
        if (!budget) {
            throw new Error('Budget not found');
        }
        if(incomeOrExpense === "expense"){
            for(let i = 1; i <= budget.customExpenses[category].length; i++){
                if(budget.customExpenses[category][i]._id === items[0]._id) {
                    await budget.customExpenses[category].splice(i, 1);
                    budget.markModified('customExpenses');
                    break;
                }
            }
        }
        if (incomeOrExpense === "income"){
            for(let i = 0; i <= budget.customIncomes["income"].length; i++){
                if(budget.customIncomes["income"][i]._id === items[0]._id) {
                    await budget.customIncomes["income"].splice(i, 1);
                    budget.markModified('customIncomes');
                    break;
                }
            }
        }
        await budget.save();
        
    } catch (error) {
        throw new Error(`Error deleting custom income/expense ${username}: ${error.message}`);
    }
}

async function getMonthlyBudget(username, month, year) {
  const budgetId = await fetchUserBudgetId(username);
  const budget = await Budget.findById(budgetId);
  const monthlyRecord = budget.monthlyRecords.find(record => record.month === month && record.year === year);
  return monthlyRecord || { month, year, income: 0, expenses: 0, savings: 0 };
}

async function updateMonthlyBudget(username, month, year, { income, expenses, savings }) {
  const budgetId = await fetchUserBudgetId(username);
  const budget = await Budget.findById(budgetId);
  let monthlyRecord = budget.monthlyRecords.find(record => record.month === month && record.year === year);
  
  if (monthlyRecord) {
    monthlyRecord.income = income;
    monthlyRecord.expenses = expenses;
    monthlyRecord.savings = savings;
  } else {
    budget.monthlyRecords.push({ month, year, income, expenses, savings });
  }

  await budget.save();
}

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
    fetchCustomExpensesByMonthAndYear: fetchCustomExpensesByMonthAndYear,
    deleteCustom: deleteCustom,
    getMonthlyBudget: getMonthlyBudget,
    updateMonthlyBudget: updateMonthlyBudget,
};
