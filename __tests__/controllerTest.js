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
describe("Test of fetchUserBudgetID", () => {
    test('Test for John Doe, should ideally be true', async () => {
        const result = await budgetTest.fetchUserBudgetId("John Doe");
        expect(JSON.stringify(result)).toBe(JSON.stringify("660144cf1d605c84aded5926"));
    });

    test('Test for John Doe med forkert id, should ideally be true (not false)', async () => {
        const result = await budgetTest.fetchUserBudgetId("John Doe");
        expect(JSON.stringify(result)).not.toBe(JSON.stringify("101FAKE_NUMBER101"));
    });
    
    test('Test for non-existent user, should throw an error', async () => {
        let userForTest = "Non Existent User";
        await expect(budgetTest.fetchUserBudgetId(userForTest)).rejects.toThrow(`No user found with name ${userForTest}`);
    });
    
});

// Test of the updateBudget-function
describe("Test of updateBudget", () => {
    test('Test for updating John Doe, should ideally be true', async () => {
        const result = await budgetTest.updateBudget("John Doe", { income: 1000 });
        expect(JSON.stringify(result.income)).toBe(JSON.stringify(1000));
    });
    
    test('Test for updating John Doe, should ideally be true (not false)', async () => {
        const result = await budgetTest.updateBudget("John Doe", { income: 1000 });
        expect(JSON.stringify(result.income)).not.toBe(JSON.stringify(9999));
    });
});
