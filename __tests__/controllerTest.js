const mongoose = require('mongoose');
const { createUserWithBudget, fetchUserBudgetId, addCustomExpense, deleteUser, updateMonthlyBudget } = require('../controllers/budgetController');
const User = require('../models/user');
const Budget = require('../models/budget');

describe('Budget Controller', () => {

  beforeEach(async () => {            // Clear the database before each test
    await User.deleteMany({});
    await Budget.deleteMany({});
  });

  describe('createUserWithBudget', () => {  // Testing createUserWithBudget function from budgetController.js
    test('should create a user with a default budget', async () => {
      const username = 'TestUser';      // Create dummy username
      const password = 'password';      // Create dummy password
      const user = await createUserWithBudget(username, password); // Call the function with dummy username and pass and put response into "user" variable

      expect(user).toHaveProperty('name', username.toLowerCase()); // Expect user.name to be "TestUser" in lowercase
      expect(user).toHaveProperty('password', password);           // Expect user.password to exist
      expect(user).toHaveProperty('budget');                       // Expect user to have .budget property

      const budget = await Budget.findById(user.budget);           // Expect property budget to have the following key and values
      expect(budget.monthlyRecords[0].income).toBe(0);
      expect(budget.monthlyRecords[0].expenses).toBe(0);
      expect(budget.monthlyRecords[0].savings).toBe(0);
      expect(budget).toHaveProperty('customExpenses', {});
    });
  });

  describe('fetchUserBudgetId', () => { // Testing fetchUserBudgetId  from budgetController.js
    test('should fetch the correct budget ID for a given user', async () => {
      const username = 'TestUser';
      const password = 'password';
      await createUserWithBudget(username, password);                     // Needs to create a user before being able 
      const budgetId = await fetchUserBudgetId(username.toLowerCase());   // Fetch budget id from budget object with username

      const user = await User.findOne({ name: username.toLowerCase() });  // Fetch budget id from user object with username
      expect(budgetId.toString()).toEqual(user.budget.toString());        // Expect budgetID to equal to value of property .budget from user
    });

    test('should throw an error if the user does not exist', async () => {  // Expect error if something is not working
      await expect(fetchUserBudgetId('NonExistentUser')).rejects.toThrow('No user found with name NonExistentUser'); 
    });
  });

  describe('updateMonthlyBudget', () => {  // Testing updateMonthlyBudget function from budgetController.js
    test('should update monthly budget correctly', async () => {

      const currentDate = new Date();                  // Get current month and year
      const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
      const currentYear = currentDate.getFullYear();
      
      const username = 'TestUser';
      const password = 'password';
      const data = { income: 1000, expenses: 500, savings: 500 };  // Create dummy fixed monthly data

      const user = await createUserWithBudget(username, password);
      await updateMonthlyBudget(username.toLowerCase(), currentMonth, currentYear, data);
      const budget = await Budget.findById(user.budget);  // Fetch budget

      expect(budget.monthlyRecords[0].income).toBe(data.income);      // Expect income data to be same as given above  
      expect(budget.monthlyRecords[0].expenses).toBe(data.expenses);  // Expect expense data to be same as given above 
      expect(budget.monthlyRecords[0].savings).toBe(data.savings);    // Expect savings data to be same as given above 
    });

    test('should throw an error if the newData is not an object', async () => {
      const username = 'TestUser';
      const password = 'password';
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
      const currentYear = currentDate.getFullYear();
      
      await createUserWithBudget(username, password);
      
      await expect(updateMonthlyBudget(username.toLowerCase(), currentMonth, currentYear, { testData: null })).rejects.toThrow('One or more of the data fields are empty'); // If an error is thrown, expect this error message
    });
  });

  describe('addCustomExpense', () => { // Testing addCustomExpense function from budgetController.js
    test('should add a custom expense to the user\'s budget', async () => {
      const username = 'TestUser';
      const password = 'password';
      await createUserWithBudget(username, password);
      const category = 'Food';                        // Creating dummy data
      const items = [{ name: 'Pizza', cost: 20 }];    // Creating dummy data

      const updatedBudget = await addCustomExpense(username.toLowerCase(), { category, items });
      expect(updatedBudget.customExpenses[category]).toEqual(expect.arrayContaining(items));  // Expect the customExpense property to have a property named 'category' containing the items array
    });
    test('should throw an error if the user does not exist', async () => {
      const category = 'Food';                        // Creating dummy data
      const items = [{ name: 'Pizza', cost: 20 }];    // Creating dummy data
      // Attempt to add custom expense to a user that doesnt exist and expect error throw message
      await expect(addCustomExpense('NonExistentUser', { category, items })).rejects.toThrow('Problem adding custom expense for NonExistentUser: Error finding UserID for NonExistentUser: No user found with name NonExistentUser');
    });
});
  describe('deleteUser', () => {   // Testing deleteUser function from budgetController.js
    test('should delete a user and their associated budget', async () => {
      const username = 'TestUser';
      const password = 'password';
      await createUserWithBudget(username, password);

      const existingUser = await User.findOne({ name: username.toLowerCase() });        // Fetch the user to get the budget ID before deletion
      const budgetId = existingUser.budget;

      await deleteUser(username.toLowerCase());

      const userAfterDeletion = await User.findOne({ name: username.toLowerCase() });  // Attempt to find deleted user and put response in "userAfterDeletion"
      expect(userAfterDeletion).toBeNull();                                            // Expect userAfterDeletion to be null

      const budgetAfterDeletion = await Budget.findById(budgetId);                     // Attempt to find deleted budget and put response in "budgetAfterDeletion"
      expect(budgetAfterDeletion).toBeNull();                                          // Expect budgetAfterDeletion to be null
    });
  });
});
