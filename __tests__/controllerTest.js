const mongoose = require('mongoose');
const { createUserWithBudget, fetchUserBudgetId, addCustomExpense, deleteUser, updateMonthlyBudget } = require('../controllers/budgetController');
const User = require('../models/user');
const Budget = require('../models/budget');

describe('Budget Controller', () => {

  beforeEach(async () => {
    // Clear the database before each test
    await User.deleteMany({});
    await Budget.deleteMany({});
  });

  describe('createUserWithBudget', () => {
    test('should create a user with a default budget', async () => {
      const username = 'TestUser';
      const password = 'password';
      const user = await createUserWithBudget(username, password);

      expect(user).toHaveProperty('name', username.toLowerCase());
      expect(user).toHaveProperty('password', password);
      expect(user).toHaveProperty('budget');

      const budget = await Budget.findById(user.budget);
      expect(budget.monthlyRecords[0].income).toBe(0);
      expect(budget.monthlyRecords[0].expenses).toBe(0);
      expect(budget.monthlyRecords[0].savings).toBe(0);
      expect(budget).toHaveProperty('customExpenses', {});
    });
  });

  describe('fetchUserBudgetId', () => {
    test('should fetch the correct budget ID for a given user', async () => {
      const username = 'TestUser';
      const password = 'password';
      await createUserWithBudget(username, password);
      const budgetId = await fetchUserBudgetId(username.toLowerCase());

      const user = await User.findOne({ name: username.toLowerCase() });
      expect(budgetId.toString()).toEqual(user.budget.toString());
    });

    test('should throw an error if the user does not exist', async () => {
      await expect(fetchUserBudgetId('NonExistentUser')).rejects.toThrow('No user found with name NonExistentUser');
    });
  });

  describe('updateMonthlyBudget', () => {
    test('should update monthly budget correctly', async () => {

      // Get current month and year
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
      const currentYear = currentDate.getFullYear();
      // Mock data
      const username = 'TestUser';
      const password = 'password';
      const data = { income: 1000, expenses: 500, savings: 500 };

      const user = await createUserWithBudget(username, password);
      await updateMonthlyBudget(username.toLowerCase(), currentMonth, currentYear, data);
      const budget = await Budget.findById(user.budget);

      expect(budget.monthlyRecords[0].income).toBe(data.income);
      expect(budget.monthlyRecords[0].expenses).toBe(data.expenses);
      expect(budget.monthlyRecords[0].savings).toBe(data.savings);
    });

    test('should throw an error if the newData is not an object', async () => {
      const username = 'TestUser';
      const password = 'password';
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
      const currentYear = currentDate.getFullYear();
      
      await createUserWithBudget(username, password);
      
      await expect(updateMonthlyBudget(username.toLowerCase(), currentMonth, currentYear, { testData: null })).rejects.toThrow('One or more of the data fields are empty');
    });
  });

  describe('addCustomExpense', () => {
    test('should add a custom expense to the user\'s budget', async () => {
      const username = 'TestUser';
      const password = 'password';
      await createUserWithBudget(username, password);
      const category = 'Food';
      const items = [{ name: 'Pizza', cost: 20 }];

      const updatedBudget = await addCustomExpense(username.toLowerCase(), { category, items });
      expect(updatedBudget.customExpenses[category]).toEqual(expect.arrayContaining(items));
    });
    test('should throw an error if the user does not exist', async () => {
      const category = 'Food';
      const items = [{ name: 'Pizza', cost: 20 }];
    
      await expect(addCustomExpense('NonExistentUser', { category, items })).rejects.toThrow('Problem adding custom expense for NonExistentUser: Error finding UserID for NonExistentUser: No user found with name NonExistentUser');
    });
});
  describe('deleteUser', () => {
    test('should delete a user and their associated budget', async () => {
      const username = 'TestUser';
      const password = 'password';
      await createUserWithBudget(username, password);

      // Fetch the user to get the budget ID before deletion
      const existingUser = await User.findOne({ name: username.toLowerCase() });
      const budgetId = existingUser.budget;

      await deleteUser(username.toLowerCase());

      const userAfterDeletion = await User.findOne({ name: username.toLowerCase() });
      expect(userAfterDeletion).toBeNull();

      // Use the previously fetched budgetId to check if the budget has been deleted
      const budgetAfterDeletion = await Budget.findById(budgetId);
      expect(budgetAfterDeletion).toBeNull();
    });
  });
});
