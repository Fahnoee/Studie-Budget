const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
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
      const user = await createUserWithBudget(username);

      expect(user).toHaveProperty('name', username);
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
      await createUserWithBudget(username);
      const budgetId = await fetchUserBudgetId(username);

      const user = await User.findOne({ name: username });
      expect(budgetId.toString()).toEqual(user.budget.toString());
    });

    it('should throw an error if the user does not exist', async () => {
      await expect(fetchUserBudgetId('NonExistentUser')).rejects.toThrow('No user found with name NonExistentUser');
    });
  });

  describe('updateBudget', () => {
    it('should update the budget for a given user', async () => {
      const username = 'TestUser';
      await createUserWithBudget(username);
      const newData = { income: 1000, expenses: 500, goal: 100 };

      const updatedBudget = await updateBudget(username, newData);
      expect(updatedBudget).toHaveProperty('income', newData.income);
      expect(updatedBudget).toHaveProperty('expenses', newData.expenses);
      expect(updatedBudget).toHaveProperty('goal', newData.goal);
    });

    it('should throw an error if the newData is not an object', async () => {
      const username = 'TestUser';
      await createUserWithBudget(username);
      await expect(updateBudget(username, null)).rejects.toThrow('newData must be a non-null object');
    });
  });

  describe('addCustomExpense', () => {
    it('should add a custom expense to the user\'s budget', async () => {
      const username = 'TestUser';
      await createUserWithBudget(username);
      const category = 'Food';
      const items = [{ name: 'Pizza', cost: 20 }];

      const updatedBudget = await addCustomExpense(username, { category, items });
      expect(updatedBudget.customExpenses[category]).toEqual(expect.arrayContaining(items));
    });
  });

  describe('deleteUser', () => {
    it('should delete a user and their associated budget', async () => {
      const username = 'TestUser';
      await createUserWithBudget(username);

      // Fetch the user to get the budget ID before deletion
      const existingUser = await User.findOne({ name: username });
      const budgetId = existingUser.budget;

      await deleteUser(username);

      const userAfterDeletion = await User.findOne({ name: username });
      expect(userAfterDeletion).toBeNull();

      // Use the previously fetched budgetId to check if the budget has been deleted
      const budgetAfterDeletion = await Budget.findById(budgetId);
      expect(budgetAfterDeletion).toBeNull();
    });
  });
});
