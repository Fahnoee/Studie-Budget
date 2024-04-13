const budgetTest = require('../controllers/budgetController.js');

// Connect to app.js
const app = require('../app.js');

// Assuming you require mongoose and have access to the `mongoDB` URI in the test suite
const mongoose = require("mongoose");
let db;
  
//beforeEach is from the jets framework, and does this every time before a test
beforeEach(async () => {
  mongoose.set("strictQuery", false);
  
  // Connect to MongoDB before each test
  db = await mongoose.connect(process.env.MONGODB_URI);
});
  
afterEach(async () => {
  // Disconnect from MongoDB after each test
  await db.connection.close();
});


// Test of the fetchUserBudgetID-function
describe("fetchUserBudgetID", () => {
    // Using test.each to run the same test with different inputs and expected outputs
    test.each([
        ["John Doe", JSON.stringify("660144cf1d605c84aded5926"), true], // This test case is expected to pass because the ID matches.
        ["John Doe", JSON.stringify("101FAKE_NUMBER101"), false] // This test case is expected to fail because the ID does not match.
    ])("fetching budget ID for '%s'", async (username, expectedId, shouldMatch) => {
        // Call the function with the username and store the result
        const result = await budgetTest.fetchUserBudgetId(username);
        // Depending on the value of shouldMatch, check if the result matches or does not match the expectedId
        if (shouldMatch) {
            expect(JSON.stringify(result)).toEqual(expectedId); // Use .toEqual for value equality
        } else {
            expect(JSON.stringify(result)).not.toBe(expectedId); // Use .not.toBe when expecting a mismatch
        }
    });

    // Testing error handling for when a user does not exist
    test('throws an error for a non-existent user', async () => {
        const userForTest = "Non Existent User";
        // Expect the promise to be rejected and to throw an error with a specific message
        await expect(budgetTest.fetchUserBudgetId(userForTest)).rejects.toThrow(`No user found with name ${userForTest}`);
    });
});

// Group tests related to the updateBudget function
describe("Test of updateBudget", () => {
    // Test updating a user's budget and expect the income to be updated correctly
    test('Test for updating John Doe, should ideally be true', async () => {
        // Call the updateBudget function and check if the income is updated to 1000
        const result = await budgetTest.updateBudget("John Doe", { income: 1000 });
        expect(result.income).toBe(1000); // Use .toBe for exact match
    });
    
    // Test to ensure the income is not set to an incorrect value
    test('Test for updating John Doe, should ideally be true (not false)', async () => {
        // Call the updateBudget function and verify the income is not mistakenly set to 9999
        const result = await budgetTest.updateBudget("John Doe", { income: 1000 });
        expect(result.income).not.toBe(9999); // Use .not.toBe to ensure the income is not equal to 9999
    });
});


describe("createUserWithBudget", () => {
    test("should create a user with default budget values", async () => {
        const username = "Test User";
        const user = await budgetTest.createUserWithBudget(username);

        expect(user).toBeDefined();
        expect(user.name).toBe(username);
        expect(user.budget).toBeDefined();

        // Optionally, fetch the budget from the database to verify its values
        const Budget = require('../models/budget.js');
        const budget = await Budget.findById(user.budget);

        expect(budget.income).toBe(0);
        expect(budget.expenses).toBe(0);
        expect(budget.goal).toBe(0);
        expect(budget.customExpenses).toEqual({});
    });
});

describe("addCustomExpense", () => {
    test("should add a custom expense to John Doe's budget", async () => {
        const username = "Test User";
        const customExpense = { category: "Food", items: [{ name: "Pizza", price: 100 }] };
        const updatedBudget = await budgetTest.addCustomExpense(username, customExpense);
        
        expect(updatedBudget.customExpenses[customExpense.category]).toContainEqual(expect.objectContaining(customExpense.items[0]));
    });
});
