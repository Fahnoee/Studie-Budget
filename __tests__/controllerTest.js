const mongoose = require('mongoose');
const { createUserWithBudget, fetchUserBudgetId, updateBudget, addCustomExpense, deleteUser } = require('../controllers/budgetController');
const User = require('../models/user');
const Budget = require('../models/budget');

describe('Budget Controller', () => {

  beforeEach(async () => {
    // Clear the database before each test
    await User.deleteMany({});
    await Budget.deleteMany({});
  });

  describe('createUserWithBudget', () => {
    it('should create a user with a default budget', async () => {
      const username = 'TestUser';
      const password = 'password';
      const user = await createUserWithBudget(username, password);

      expect(user).toHaveProperty('name', username.toLowerCase());
      expect(user).toHaveProperty('password', password);
      expect(user).toHaveProperty('budget');

      const budget = await Budget.findById(user.budget);
      expect(budget).toHaveProperty('income', 0);
      expect(budget).toHaveProperty('expenses', 0);
      expect(budget).toHaveProperty('goal', 0);
      expect(budget).toHaveProperty('customExpenses', {});
    });
  });

  describe('fetchUserBudgetId', () => {
    it('should fetch the correct budget ID for a given user', async () => {
      const username = 'TestUser';
      const password = 'password';
      await createUserWithBudget(username, password);
      const budgetId = await fetchUserBudgetId(username.toLowerCase());

      const user = await User.findOne({ name: username.toLowerCase() });
      expect(budgetId.toString()).toEqual(user.budget.toString());
    });

    it('should throw an error if the user does not exist', async () => {
      await expect(fetchUserBudgetId('NonExistentUser')).rejects.toThrow('No user found with name NonExistentUser');
    });
  });

  describe('updateBudget', () => {
    it('should update the budget for a given user', async () => {
      const username = 'TestUser';
      const password = 'password';
      await createUserWithBudget(username, password);
      const newData = { income: 1000, expenses: 500, goal: 100 };

      const updatedBudget = await updateBudget(username.toLowerCase(), newData);
      expect(updatedBudget).toHaveProperty('income', newData.income);
      expect(updatedBudget).toHaveProperty('expenses', newData.expenses);
      expect(updatedBudget).toHaveProperty('goal', newData.goal);
    });

    it('should throw an error if the newData is not an object', async () => {
      const username = 'TestUser';
      const password = 'password';
      await createUserWithBudget(username, password);
      await expect(updateBudget(username.toLowerCase(), null)).rejects.toThrow('newData must be a non-null object');
    });
  });

  describe('addCustomExpense', () => {
    it('should add a custom expense to the user\'s budget', async () => {
      const username = 'TestUser';
      const password = 'password';
      await createUserWithBudget(username, password);
      const category = 'Food';
      const items = [{ name: 'Pizza', cost: 20 }];

      const updatedBudget = await addCustomExpense(username.toLowerCase(), { category, items });
      expect(updatedBudget.customExpenses[category]).toEqual(expect.arrayContaining(items));
    });
    it('should throw an error if the category is not provided', async () => {
      const username = 'TestUser';
      const password = 'password';
      await createUserWithBudget(username, password);
      const items = [{ name: 'Pizza', cost: 20 }];

      await expect(addCustomExpense(username.toLowerCase(), { items })).rejects.toThrow('Category is required');
    });

    it('should throw an error if items are not provided', async () => {
      const username = 'TestUser';
      const password = 'password';
      await createUserWithBudget(username, password);
      const category = 'Food';

      await expect(addCustomExpense(username.toLowerCase(), { category })).rejects.toThrow('Items are required');
    });
    it('should throw an error if items is not an array', async () => {
      const username = 'TestUser';
      const password = 'password';
      await createUserWithBudget(username, password);
      const category = 'Food';
      const items = { name: 'Pizza', cost: 20 };
    
      await expect(addCustomExpense(username.toLowerCase(), { category, items })).rejects.toThrow('Items must be an array');
    });
    it('should throw an error if an item is missing required properties', async () => {
      const username = 'TestUser';
      const password = 'password';
      await createUserWithBudget(username, password);
      const category = 'Food';
      const items = [{ name: 'Pizza' }];
    
      await expect(addCustomExpense(username.toLowerCase(), { category, items })).rejects.toThrow('Each item must have a name and cost');
    });
    it('should throw an error if the user does not exist', async () => {
      const category = 'Food';
      const items = [{ name: 'Pizza', cost: 20 }];
    
      await expect(addCustomExpense('NonExistentUser', { category, items })).rejects.toThrow('Problem adding custom expense for NonExistentUser: Error finding UserID for NonExistentUser: No user found with name NonExistentUser');
    });
});
  describe('deleteUser', () => {
    it('should delete a user and their associated budget', async () => {
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
