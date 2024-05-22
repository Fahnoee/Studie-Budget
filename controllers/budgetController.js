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
        const user = await User.findOne({ name: username }).exec(); // Attempt to find a user by their username using Mongoose .findOne()
        // If no user is found, throw an error
        if (!user) {
            throw new Error(`No user found with name ${username}`);
        }

        return user.budget; // Return the user's budget ID
    } catch (error) {
        // Catch and re-throw any errors encountered during the operation
        throw new Error(`Error finding UserID for ${username}: ${error.message}`);
    }
}

/**
 * Creates a new user with a default budget initialized with the current month and year.
 * The default budget includes initial values for income, expenses, savings, and an array of monthly records.
 * @async
 * @param {string} username - The username for the new user.
 * @param {string} password - The password for the new user.
 * @returns {Promise<Object>} A promise that resolves with the newly created user document.
 * @throws {Error} If the user already exists or if there's an error during user creation.
 */
async function createUserWithBudget(username, password) {
    username = username.toLowerCase();  // Normalize username to lowercase

    const existingUser = await User.findOne({ name: username }).exec();  // Attemts to find user using mongoose .findOne()s
    // Check if user already exists
    if (existingUser) {
        throw new Error('User already exists');
    }

    // Get current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
    const currentYear = currentDate.getFullYear();

    // Set default values for the budget, including an initial monthly record
    const defaultBudget = {
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

    // Tries to creat a user and a budget
    try {
        const newBudget = await Budget.create(defaultBudget);   // Uses Mongoose .create() to make a budget with default setup
        const newUser = await User.create({ name: username, password: password, budget: newBudget._id });
        return newUser;
        
    } catch (error) {
        throw new Error(`Error creating user with budget: ${error.message}`);
    }
}

/**
 * Adds custom expense items under a specific category for a user's budget.
 * It is also used for editing category limits (goals) and names.
 * @async
 * @param {string} username - The username of the user.
 * @param {{category: string, items: Array}} itemObject - The category and items to add.
 * @param {string} newName - The new name for a given category
 * @returns {Promise<Object>} - A promise that resolves with the updated budget document.
 * @throws {Error} - If no budget is found for the user or if the update operation fails.
 * 
 * Example on how the "limit/goal" item is set:
 * 
 * let items = [{ "name": "##GOAL##", 
 *     "value": "400", 
 *     "color": "#f00000" }];
 */
async function addCustomExpense(username, { category, items }, newName) {
    try {
        const budgetId = await fetchUserBudgetId(username);  // Get the users budget ID
        if (!budgetId) {
            throw new Error(`No budget found for user ${username}`);
        }
        
        const budget = await Budget.findById(budgetId);     // From the id, the entire budget is loaded
        if (!budget) {
            throw new Error('Budget not found');
        }
        
        if (!budget.customExpenses) {
            budget.customExpenses = {}; // Initialize if null (MongoDB tends to convert empty objects to null, which cannot be accessed)
        }
        // Initialize the category if it doesn't exist
        if (!budget.customExpenses[category]) {
            budget.customExpenses[category] = [];
            // Sends Limit and items
            items.forEach(item => budget.customExpenses[category].push(item)); // Use of forEach due to addCustomExpense also is called when a function is renamed
            
            budget.markModified('customExpenses'); // Mark the customExpenses field as modified

        } 
        // Fixes category limit and/or category name. This should not have been in this function - Bad Code
        else if (budget.customExpenses[category][0].name === "##GOAL##" && items[0].name === "##GOAL##") {
            // If user has entered a new limit value, update it to database
            if (items[0].value){
                budget.customExpenses[category][0].value = items[0].value;
            }
            
            // If user has entered a new category name and it is not equal to the old name, update it to database
            if (newName && newName !== category ){
                budget.customExpenses[newName] = budget.customExpenses[category];   // Updates category name by inserting a copy of old category into a new one
                delete budget.customExpenses[category];                             // and the deletes the old one.
            }

            budget.markModified('customExpenses');  // Mark the customExpenses field as modified
        }
        
        // Add the new items to the category
        else {
            items.forEach(item => budget.customExpenses[category].push(item));  // Add each expense to the category
            budget.markModified('customExpenses');  // Mark the customExpenses field as modified
        }

        const updatedBudget = await budget.save();  // Save the updated budget
        return updatedBudget;

    } catch (error) {
        throw new Error(`Problem adding custom expense for ${username}: ${error.message}`);
    }
}

/**
 * Adds custom income items under the income category for a user's budget.
 * @async
 * @param {string} username - The username of the user.
 * @param {{category: string, items: Array}} itemObject - The category and items to add.
 * @returns {Promise<Object>} A promise that resolves with the updated budget document.
 * @throws {Error} If no budget is found for the user or if the update operation fails.
 */
async function addCustomIncome(username, { category, items }) {
    try {
        const budgetId = await fetchUserBudgetId(username);             // Gets a users budgetID.
        if (!budgetId) {
            throw new Error(`No budget found for user ${username}`);
        }
        const budget = await Budget.findById(budgetId);                 // Loads a users budget  from thie budgetID.
        
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
 * Finds a user by their username and password. Used to handle the login of a user.
 * @async
 * @param {string} username - The username of the user to find.
 * @param {string} password - The password of the user to authenticate.
 * @returns {Promise<Object>} A promise that resolves with the user document if found and authenticated.
 * @throws {Error} If the user is not found or the password is incorrect.
 */
async function findUserByUsernameAndPassword(username, password) {
    // Tries to find a user with a matching username & password
    try {
        const user = await User.findOne({ name: username, password: password }).exec();  //uses mongoose .findone

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
        const user = await User.findOne({ name: username }).exec();
        if (!user) {
            throw new Error(`User ${username} not found`);
        }
        // Delete the associated budget by using the mongoose .findByIdAndDelete() with take an id as input
        await Budget.findByIdAndDelete(user.budget);
        // Delete the user
        await User.findByIdAndDelete(user._id);
        console.log(`User ${username} and associated budget deleted successfully`);
        
    } catch (error) {
        throw new Error(`Error deleting user ${username}: ${error.message}`);
    };
};

/** 
 * Fetches the customExpenses from the given month and year
 * @async
 * @param {string} username - The username of the user
 * @param {string} month - The given month.
 * @param {string} year - The given year.
 * @returns {Promise<Object>} A promise is returned. It is resolved if the data is fetched.
 * @throws {Error} If the data is not fetched correctly.
 */
async function fetchCustomExpensesByMonthAndYear(username, month, year) {
    try {
        // Finds the given budget through the username
        const budgetId = await fetchUserBudgetId(username);
        const budget = await Budget.findById(budgetId);

        const filteredExpenses = {};

        // A for-loop that goes through each category and then runs a filter function on it.
        for (const category in budget.customExpenses) {
            filteredExpenses[category] = budget.customExpenses[category].filter(item => {
                // If the item is the goal it is always included
                if (item.name === "##GOAL##") {
                    return true; 
                } 
                // If the date of the expense fits with the parsed month & yearh, it is included in the filteredExpenses
                else if (item.date) {
                    const [itemDate, itemTime] = item.date.split(' ');
                    const [itemYear, itemMonth] = itemDate.split('-').map(val => parseInt(val, 10));
                    const parsedYear = parseInt(year, 10);
                    const parsedMonth = parseInt(month, 10);

                    return itemYear === parsedYear && itemMonth === parsedMonth;    // Return true if the current item exists in current moth and year
                }

                return false;   // If it does not fit with in the month & year, it returns false to exclude it from the filteredExpenses
            });
        }
        return filteredExpenses; // Return the dictionary of objects which includes all expenses in current month and year
    
    } catch (error) {
        throw new Error(`Problem fetching custom expenses for ${username}: ${error.message}`);
    };
};

/** 
 * Fetches the customIncomes from the given month and year
 * @async
 * @param {string} username - The username of the user
 * @param {string} month - The given month.
 * @param {string} year - The given year.
 * @returns {Promise<Object>} A promise is returned. It is resolved if the data is fetched.
 * @throws {Error} If the data is not fetched correctly.
 */
async function fetchCustomIncomesByMonthAndYear(username, month, year) {
    try {
        // Finds the given budget through the username
        const budgetId = await fetchUserBudgetId(username);
        const budget = await Budget.findById(budgetId);

        const filteredIncomes = {};

        // A for-loop that goes through each category and then runs a filter function on it.
        for (const category in budget.customIncomes) {
            filteredIncomes[category] = budget.customIncomes[category].filter(item => {
                // If the item is the goal it is always included
                if (item.name === "##GOAL##") {
                    return true; // Always include the goal item
                }
                // If the date of the income fits with the parsed month & yearh, it is included in the filteredIncomes
                else if (item.date) {
                    const [itemDate, itemTime] = item.date.split(' ');
                    const [itemYear, itemMonth] = itemDate.split('-').map(val => parseInt(val, 10));
                    const parsedYear = parseInt(year, 10);
                    const parsedMonth = parseInt(month, 10);
                    return itemYear === parsedYear && itemMonth === parsedMonth;
                }
                
                return false;   // If it does not fit with in the month & year, it returns false to exclude it from the filteredIncomes
            });
        }
        return filteredIncomes; // Return the dictionary of objects which includes all incomes in current month and year
    
    } catch (error) {
        throw new Error(`Problem fetching custom incomes for ${username}: ${error.message}`);
    }
}

/** 
 * Function to delete a custom income or expense
 * @async
 * @param {string} username - The username of the user
 * @param {{category: string, items: Array}} itemObject - The category and items to add.
 * @returns {Promise<Object>} A promise is returned. It is resolved if the data is deleted.
 * @throws {Error} If the data was not deletable/unable to be found.
 */
async function deleteCustom(username, { category, items }) {
    try {
        const budgetId = await fetchUserBudgetId(username); // Fetches the user
        if (!budgetId) {
            throw new Error(`No budget found for user ${username}`);
        }

        const budget = await Budget.findById(budgetId);     // Fetches the budget for that user
        if (!budget) {
            throw new Error('Budget not found');
        }

        // There is only one specific way to handle "Income", so this should go through the expenses
        if (category !== "Income") {
            for (let i = 1; i <= budget.customExpenses[category].length; i++) {
                if (budget.customExpenses[category][i]._id === items[0]._id) {
                    await budget.customExpenses[category].splice(i, 1);  // When custom expense is found, splice from array
                    budget.markModified('customExpenses');
                    break;
                }
            }
        }
        
        // If the category is "Income", delete the correct income
        if (category === "Income") {
            for (let i = 0; i <= budget.customIncomes[category].length; i++) {
                if (budget.customIncomes[category][i]._id === items[0]._id) {
                    await budget.customIncomes[category].splice(i, 1); // When custom income is found, splice from array
                    budget.markModified('customIncomes');
                    break;
                }
            }
        }
        await budget.save();    // Save to database

    } catch (error) {
        throw new Error(`Error deleting custom income/expense ${username}: ${error.message}`);
    }
}

/** 
 * Function that deletes entire category based on input category.
 * @async
 * @param {string} username - The username of the user
 * @param {string} categoryname - The category name
 * @returns {Promise<Object>} A promise is returned. It is resolved if the category is deleted.
 * @throws {Error} If the category was not deletable/unable to be found.
 */
async function deleteCategory(username, categoryName){
    try {
        const budgetId = await fetchUserBudgetId(username); // Finds the budgetId from the username
        if (!budgetId) {
            throw new Error(`No budget found for user ${username}`);
        }
        const budget = await Budget.findById(budgetId);     // Finds the budget from budgetId using mongoose
        if (!budget) {
            throw new Error('Budget not found');
        }

        if (budget.customExpenses[categoryName]) {
            await budget.updateOne(             // Uses Mongoose .updateOne() to update a single expense in the database
                { $unset: { [`customExpenses.${categoryName}`]: true } } // Removes field from database
            );
            console.log(`Category "${categoryName}" deleted from database`);
        } else {
            console.log(`Category "${categoryName}" not found in database`);
        }

    } catch (error) {
        throw new Error(`Error deleting category: ${categoryName} , ${username}: ${error.message}`);
    }
}


/**
 * Fetches the budget of a given month and year.
 * @async
 * @param {string} username - Username of current user
 * @param {string} month - Current month
 * @param {string} year - Current year
 * @returns {Object} Object including current month and year, and their income, expense and savings
 */
async function getMonthlyBudget(username, month, year) {
    const budgetId = await fetchUserBudgetId(username); // Find budget ID using session username
    const budget = await Budget.findById(budgetId);     // Find entire budget using the budget ID
    const monthlyRecord = budget.monthlyRecords.find(record => record.month === month && record.year === year); // Find the budget record that aligns with current month and year
    
    return monthlyRecord || { month, year, income: 0, expenses: 0, savings: 0 };
}

/**
 * Updates the fixed monthly income, expenses and saving of a given month and year to the database.
 * @async
 * @param {string} username - Username of current user
 * @param {string} month - Current month
 * @param {string} year - Current year
 * @param {{income: Number, expenses: Number, savings: Number}} itemObject - Object including the fixed monthly income, expenses and saving for the given month
 */
async function updateMonthlyBudget(username, month, year, { income, expenses, savings }) {
    try {
        const budgetId = await fetchUserBudgetId(username); // Find budget ID using session username
        const budget = await Budget.findById(budgetId);     // Find entire budget using the budget ID
        let monthlyRecord = budget.monthlyRecords.find(record => record.month === month && record.year === year); // Find the budget record that aligns with current month and year
        
        // Throw error if no data was given to function
        if (!income || !expenses || !savings) {
            throw new Error(`One or more of the data fields are empty`);
        }

        // If the record exists, update the income, expenses and saving
        if (monthlyRecord) {
            monthlyRecord.income = income;
            monthlyRecord.expenses = expenses;
            monthlyRecord.savings = savings;
        } else {
            budget.monthlyRecords.push({ month, year, income, expenses, savings }); // Else create new record
        }
        await budget.save();    // Save to database

    } catch (error) {
        throw new Error(`Problem updating monthly budget for ${username}: ${error.message}`);
    }
}

// Export all needed functions with correct function name. This could have been done simpler
module.exports = {
    User: User,
    Budget: Budget,
    fetchUserBudgetId: fetchUserBudgetId,
    createUserWithBudget: createUserWithBudget,
    addCustomExpense: addCustomExpense,
    addCustomIncome: addCustomIncome,
    deleteUser: deleteUser,
    findUserByUsernameAndPassword: findUserByUsernameAndPassword,
    fetchCustomExpensesByMonthAndYear: fetchCustomExpensesByMonthAndYear,
    fetchCustomIncomesByMonthAndYear: fetchCustomIncomesByMonthAndYear,
    deleteCustom: deleteCustom,
    getMonthlyBudget: getMonthlyBudget,
    updateMonthlyBudget: updateMonthlyBudget,
    deleteCategory: deleteCategory,
};
