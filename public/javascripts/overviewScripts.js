//#####################
// Constants and Configuration
//#####################
const body = document.querySelector('body');
const pie = document.querySelector('.pie');
const totalAmount = document.querySelector(".total");
const spentAmount = document.querySelector(".spent");
const leftAmount = document.querySelector(".left");
const savingsAmount = document.querySelector(".savings");

let currentYear = new Date().getFullYear();
let currentMonthIndex = new Date().getMonth();

const API_ENDPOINTS = {
  fetchBudget: "/api/budget/:budgetID",
  addCustomExpense: "/api/addcustom/expense",
  addCustomIncome: "/api/addcustom/income",
  deleteData: "/api/deletecustom",
  fetchCustomExpensesByMonthAndYear: "/api/customexpenses/:month/:year",
  fetchMonthlyBudget: "/api/monthlybudget/:month/:year",
  updateMonthlyBudget: "/api/update_monthly_budget",
  fetchCustomIncomesByMonthAndYear: "/api/customeincomes/:month/:year",
  deleteCategory: "/api/deletecategory",
};

//#############
// Q-SELECTORS
//#############

// FIXED
const showPopupFixed = document.querySelector('.show-popup-fixed');
const popupContainerFixed = document.querySelector('.popup-container-fixed');
const closeBtnFixed = document.querySelector('.close-btn-fixed');
const saveBtnFixed = document.querySelector('.save-btn-fixed');
const incomeFixed = document.querySelector(".income-fixed");
const expenseFixed = document.querySelector(".expense-fixed");
const savingsFixed = document.querySelector(".savings-fixed");
const toolTip = document.querySelector(".tooltiptext");

// EXPENSE
const showPopupCustomExpense = document.querySelector('.show-popup-expense');
const popupContainerCustomExpense = document.querySelector('.popup-container-expense');
const closeBtnCustomExpense = document.querySelector('.close-btn-expense');
const saveBtnCustomExpense = document.querySelector('.save-btn-expense');
const dropdownExpense = document.querySelector('.dropdown-expense');
const nameCustomExpense = document.querySelector('.name-expense');
const valueCustomExpense = document.querySelector('.value-expense');

// INCOME
const showPopupCustomIncome = document.querySelector('.show-popup-income');
const popupContainerCustomIncome = document.querySelector('.popup-container-income');
const closeBtnCustomIncome = document.querySelector('.close-btn-income');
const saveBtnCustomIncome = document.querySelector('.save-btn-income');
const nameCustomIncome = document.querySelector('.name-income');
const valueCustomIncome = document.querySelector('.value-income');

// ADD CATEGORIES
const categoryBtn = document.querySelector('.add-circle');
const addCategoryDialog = document.querySelector('.add-category-dialog');
const categoryName = document.querySelector('.category-name');
const categoryGoal = document.querySelector('.category-goal');
const categoryColor = document.querySelector('.category-color');
const closeBtnCategory = document.querySelector('.close-btn-category');
const saveBtnCategory = document.querySelector('.save-btn-category');

// EDIT CATEGORIES
const categories = document.querySelector(".categories");
const editCategoryDialog = document.querySelector('.edit-category-dialog');
const editCategoryBtn = document.querySelector('.show-edit-categories');
const deleteBtnEditCategory = document.querySelector('.delete-btn-category-edit');
const editCategoryName = document.querySelector('.name-edit');
const editCategoryGoal = document.querySelector('.goal-edit');
const closeBtnEditCategory = document.querySelector('.close-btn-category-edit');
const saveBtnEditCategory = document.querySelector('.save-btn-category-edit');
const dropdownEdit = document.querySelector('.dropdown-edit');

// HISTORY
const table = document.querySelector('.styled-table');

//#####################
// FUNCTIONS FOR POPUP
//#####################
////////FIXED INCOMES/ EXPENSES
// Function for popup buttons
showPopupFixed.onclick = () => {
  popupContainerFixed.classList.add("active");     // Activates popup by adding class to div
  incomeFixed.value = localStorage.getItem('incomeFixed') || '';
  expenseFixed.value = localStorage.getItem('expenseFixed') || '';
  savingsFixed.value = localStorage.getItem('savingsFixed') || '';
};

// Function for the Close Button
closeBtnFixed.onclick = () => {
  popupContainerFixed.classList.remove("active");    // Deactivates popup by removing class from div
};

categoryBtn.onclick = async () => {
  let month = currentMonthIndex + 1; // JavaScript months are 0-indexed, add 1 for consistency with common representations
  let year = currentYear;
  const monthlyBudget = await fetchMonthlyBudget(month, year);
  incomeFixed.value = monthlyBudget.income || 0;
  expenseFixed.value = monthlyBudget.expenses || 0;
  savingsFixed.value = monthlyBudget.savings || 0;

  if (incomeFixed.value == '0' && expenseFixed.value == '0' && savingsFixed.value == '0') {
    alert("Please set up monthly income and expenses first in the primary budget overview");
  }
  else {
    addCategoryDialog.showModal();
  }
};

closeBtnCategory.onclick = () => {
  categoryName.value = "";
  categoryGoal.value = "";
  addCategoryDialog.close();
};

saveBtnCategory.onclick = async () => {
  if (isNaN(parseFloat(categoryGoal.value))) {
    alert("Please enter a valid number for the category goal.");
    return; // Exit function if the category goal is not a number
  }

  //if user enters negative goal, set it to positive
  if (categoryGoal.value < 0) {
    categoryGoal.value *= (-1);
  }


  if (await categoryAvailableCheck(categoryName.value)) {
    alert("Category name already in use");
  }
  else {
    addCategoryDialog.close();
    await inputCategoryToBackend();
    spawnCategory(categoryName.value, categoryColor.value);  // Create category
    await updateCategory();
    await updateUserValuesView();
    categoryName.value = "";
    categoryGoal.value = "";
  }
};

editCategoryBtn.onclick = async () => {
  await dropDownFetchCategories(dropdownEdit);
  const month = currentMonthIndex + 1;
  const year = currentYear;
  const data = await fetchDatabase(); // Fetch data from the database
  const monthlyBudget = await fetchMonthlyBudget(month, year);

  incomeFixed.value = monthlyBudget.income || 0;
  expenseFixed.value = monthlyBudget.expenses || 0;
  savingsFixed.value = monthlyBudget.savings || 0;

  if (incomeFixed.value == '0' && expenseFixed.value == '0' && savingsFixed.value == '0') {
    alert("Please set up monthly income and expenses first in the primary budget overview");
    return;
  }

  if (!data.customExpenses || Object.keys(data.customExpenses).length === 0) {
    alert("No category found. Please create category first.");
    return;
  } else {

    editCategoryDialog.showModal();
  }
};

deleteBtnEditCategory.onclick = async () => {
  const dataPackage = {
    username,
    category: dropdownEdit.value,
  };

  // Get the category name
  const categoryName = dropdownEdit.value;

  // Confirmation dialog with dynamic category name
  const confirmation = window.confirm(`Are you sure you want to delete the category "${categoryName}"?`);

  if (confirmation) {  // User clicked OK, proceed with deletion
    await deleteCategory(dataPackage);
    editCategoryDialog.close();
    await updateCategory();
    await updateUserValuesView();
    await refreshCategories();
  }
};

closeBtnEditCategory.onclick = () => {
  categoryName.value = "";
  categoryGoal.value = "";
  editCategoryDialog.close();
};

saveBtnEditCategory.onclick = async () => {

  editCategoryDialog.close();

  //checks if user tries to rename a category into and already esisting
  if (editCategoryName.value == dropdownEdit.value) {
    return;
  } else if (await categoryAvailableCheck(editCategoryGoal.value)) {
    alert("Category name is allready in use.");
    return; // Exit function if any input is not a number
  }


  if (isNaN(editCategoryGoal.value)) {
    alert("Please enter valid number for limit.");
    return; // Exit function if any input is not a number
  }

  //If user should enter a negative number, it will be converted to positive
  if (editCategoryGoal.value < 0) {
    editCategoryGoal.value = editCategoryGoal.value * (-1);
  }

  await editCategoryToBackend();
  await updateUserValuesView();
  await refreshCategories();
};

//#####################
// FUNCTIONS FOR CATEGORIES
//##################### 
/**
 * Updates the category view by setting pie chart percentages and updating text content for each category.
 * 
 * @async
 * @function updateCategory
 * @returns {Promise<void>} A promise that resolves when the category view has been updated.
 * @throws {Error} If there is an issue fetching or processing category data.
 */
async function updateCategory() {
  try {
    // Select all paragraph elements and pie chart elements within the categories
    const paragraphs = categories.querySelectorAll("p");
    const pies = categories.querySelectorAll(".pie");

    // Fetch and process category data
    const categoryData = await fetchAndProcessCategoryData();
    let i = 0;
    
    // Iterate over each category and update the pie chart and text content
    Object.entries(categoryData).forEach(([category, items]) => {
      setPiePercentage((items.totalExpense / items.goal * 100), pies[i]); // Set pie chart percentage
      paragraphs[i].textContent = items.totalExpense + " / " + items.goal; // Update text content with total expense and goal
      i++;
    });
  } catch (error) {
    // Log any errors that occur during the update process
    console.error('An error occurred while updating the category view:', error);
    throw error; // Re-throw the error to be handled by the calling function if necessary
  }
}

/**
 * Fetches and processes custom expense data for the current month and year.
 * 
 * @async
 * @function fetchAndProcessCategoryData
 * @returns {Promise<Object>} A promise that resolves to an object containing the total expense and goal for each category.
 * @throws {Error} If there is an issue fetching or processing the custom expense data.
 */
async function fetchAndProcessCategoryData() {
  try {
    // Use currentMonthIndex and currentYear from the global scope
    const month = String(currentMonthIndex + 1);
    const year = currentYear.toString();

    // Fetch custom expenses by month and year
    const expenses = await fetchCustomExpensesByMonthAndYear(username, month, year);
    const categoriesData = {};

    // Process expenses to calculate total expenses and goals for each category
    for (const category in expenses) {
      let totalExpense = 0;
      let goal = 0; // Default goal to 0 if not found

      expenses[category].forEach(item => {
        if (item.name === "##GOAL##") {
          goal = parseFloat(item.value); // Set the goal if found
        } else {
          totalExpense += parseFloat(item.amount); // Add to total expenses
        }
      });

      // Store the total expense and goal for the category
      categoriesData[category] = { totalExpense, goal };
    }

    return categoriesData;

  } catch (error) {
    // Log any errors that occur during the fetch and process operations
    console.error('An error occurred while fetching and processing category data:', error);
    throw error; // Re-throw the error to be handled by the calling function if necessary
  }
}


/**
 * Sends the inputted category goal, name, and color to the backend for adding a new category.
 * 
 * @async
 * @function inputCategoryToBackend
 * @returns {Promise<void>} A promise that resolves when the new category has been added.
 * @throws {Error} If there is an issue adding the new category to the backend.
 */
async function inputCategoryToBackend() {
  try {
    let name = "##GOAL##";
    let items = [{ "name": name, "value": categoryGoal.value, "color": categoryColor.value }];

    // Prepare the goal data to send to the backend
    goalData = {
      username,
      customExpense: items,
      category: categoryName.value,
    };

    // Send the goal data to the backend
    await updateCustomExpense(goalData);
  } catch (error) {
    // Log any errors that occur during the update process
    console.error('An error occurred while adding the new category to the backend:', error);
  }
}
/**
 * Sends the updated category goal and name to the backend for updating.
 * 
 * @async
 * @function editCategoryToBackend
 * @returns {Promise<void>} A promise that resolves when the category has been updated.
 * @throws {Error} If there is an issue updating the category in the backend.
 */
async function editCategoryToBackend() {
  try {
    let name = "##GOAL##";
    let items = [{ "name": name, "value": editCategoryGoal.value }];

    // Prepare the goal data to send to the backend
    goalData = {
      username,
      customExpense: items,
      category: dropdownEdit.value,
      newName: editCategoryName.value,
    };

    // Send the goal data to the backend
    await updateCustomExpense(goalData);
  } catch (error) {
    // Log any errors that occur during the update process
    console.error('An error occurred while updating the category to backend:', error);
  }
}

/**
 * Creates a new category in the HTML and the database.
 * This function removes the "add category" button temporarily, creates the category elements,
 * and then re-adds the "add category" button.
 *
 * @function spawnCategory
 * @param {string} categoryTitle - The title of the category to be created.
 * @param {string} color - The color to be used for the pie chart representing the category.
 */
function spawnCategory(categoryTitle, color) {
  // Removes the "add category" button. It is later added again
  const button = categories.querySelector('button');
  button.remove();

  // Create elements for the category
  const categoryDiv = document.createElement('div');
  categoryDiv.classList.add('pie-line');  // Set class to "pie-line" to create grey circle
  categoryDiv.style.setProperty('--b', '10px');
  categoryDiv.style.marginBottom = '7%';

  // Create span element
  const span = document.createElement('span');
  span.classList.add('category-title'); // Set class to "category-text" to position title above circle
  span.textContent = categoryTitle; // Set title to user input

  // Create a div element for the pie chart 
  const pie = document.createElement('div');
  pie.classList.add('pie', 'animate'); // Add classes for styling 
  pie.style.setProperty('--w', '105px');  // Set size of circle
  pie.style.setProperty('--b', '10px');  // Set size of circle
  pie.style.setProperty('--l', '1%');  // Set size of circle
  setPieColor(pie, color)

  // Create paragraph element
  const paragraph = document.createElement('p');
  paragraph.classList.add('category-text');
  paragraph.textContent = 0;   // Set the goal for the category

  // Append the paragraph to the pie div
  pie.appendChild(paragraph)

  // Append the span and pie div to the category div
  categoryDiv.appendChild(span);
  categoryDiv.appendChild(pie);

  // Append the category div to the categories container
  categories.appendChild(categoryDiv);

  // Lastly, add back the new category button
  const newButton = document.createElement('button');
  newButton.classList.add('add-circle');
  newButton.style.marginBottom = '7%';
  newButton.textContent = '+';
  categories.appendChild(newButton);

  newButton.addEventListener('click', () => {
    addCategoryDialog.showModal();
  });
}

//#####################
// FUNCTIONS FOR DROPDOWN MENUS
//##################### 
/**
 * Fetches categories from the database and populates a dropdown menu with the categories.
 * 
 * @async
 * @function dropDownFetchCategories
 * @param {HTMLElement} dropdown - The dropdown menu element to populate with categories.
 * @returns {Promise<void>} A promise that resolves when the categories have been fetched and the dropdown updated.
 * @throws {Error} If there is an issue fetching data from the database.
 */
async function dropDownFetchCategories(dropdown) {
  try {
    dropdown.innerHTML = ''; // Clear existing options
    let data = await fetchDatabase();                  //Fetches data from database
    let categories = Object.keys(data.customExpenses); //Accesses all category names in that budget
    categories.forEach(category => {                   //Puts them into an array and displays them in the dropdown menu on the "add custom" popup
      let option = document.createElement("option");
      option.textContent = category;
      dropdown.appendChild(option);

    });
  } catch (error) {
    console.error('An error occurred fetching categories from database:', error);
  }
}

//###################
// Utility Functions
//###################
/**
 * Fetches data from a specified URL with given options.
 * 
 * @async
 * @function fetchData
 * @param {string} url - The URL to fetch data from.
 * @param {Object} [options={}] - Optional fetch options (method, headers, body, etc.).
 * @returns {Promise<Object>} A promise that resolves to the JSON response data.
 * @throws {Error} If there is an issue with the fetch request.
 */
async function fetchData(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error("Network response was not ok", response);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch Data error:", error);
    throw error;
  }
}

/**
 * Sets the percentage value for a pie chart and triggers an animation.
 * 
 * @function setPiePercentage
 * @param {number} percent - The percentage to set for the pie chart (0-100).
 * @param {HTMLElement} piechart - The pie chart element to update.
 */
function setPiePercentage(percent, piechart) {
  piechart.style.setProperty('--p', percent);
  piechart.classList.remove("animate");
  void piechart.offsetWidth; // Trigger reflow to restart CSS animation
  piechart.classList.add("animate");
}


/**
 * Sets the color for a pie chart.
 * 
 * @function setPieColor
 * @param {HTMLElement} piechart - The pie chart element to update.
 * @param {string} color - The color to set for the pie chart.
 */
function setPieColor(piechart, color) {
  piechart.style.setProperty('--c', color);
}


/**
 * Gets the current date and time formatted as a string.
 * Format: "YYYY-MM-DD HH:MM:SS"
 * 
 * @function getFormattedDate
 * @returns {string} The formatted date and time string.
 */
function getFormattedDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (currentMonthIndex + 1).toString().padStart(2, '0'); // Ensure two digits
  const day = now.getDate().toString().padStart(2, '0'); // Ensure two digits
  const hour = now.getHours().toString().padStart(2, '0'); // Ensure two digits
  const minute = now.getMinutes().toString().padStart(2, '0'); // Ensure two digits
  const second = now.getSeconds().toString().padStart(2, '0'); // Ensure two digits
  const formattedDate = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  return formattedDate;
}


//#####################
// Data Handling
//##################### 
/**
 * Fetches the entire budget database.
 * 
 * @async
 * @function fetchDatabase
 * @returns {Promise<Object>} A promise that resolves to the fetched budget data.
 * @throws {Error} If there is an issue with the fetch request.
 */
async function fetchDatabase() {
  try {
    return await fetchData(API_ENDPOINTS.fetchBudget, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching database:", error);
    // Optionally, provide user feedback or throw the error to be handled by the caller
    throw error;
  }
}

/**
 * Fetches the categories from the budget database and updates the UI.
 * 
 * @async
 * @function fetchCategories
 * @returns {Promise<void>} A promise that resolves when the categories have been fetched and UI updated.
 * @throws {Error} If there is an issue fetching or processing the categories.
 */
async function fetchCategories() {
  try {
    // Fetch the entire budget data
    const data = await fetchDatabase();
    const categories = data.customExpenses ? Object.keys(data.customExpenses) : [];

    // Update the UI with fetched categories
    categories.forEach(category => {
      spawnCategory(category, data.customExpenses[category][0].color); // getCategoryColor(category)
    });

    // Update other category-related data
    updateCategory();
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Optionally, provide user feedback or throw the error to be handled by the caller
    throw error;
  }
}


/**
 * Updates the custom expense data for a specific user.
 * 
 * This function expects an object containing the expense data to update.
 * 
 * @async
 * @function updateCustomExpense
 * @param {Object} dataExpense - The expense data object to be updated.
 * @returns {Promise<Object>} A promise that resolves to the response object from the server.
 * @throws {Error} If there is an issue with the fetch request.
 */
async function updateCustomExpense(dataExpense) {
  try {
    return await fetchData(API_ENDPOINTS.addCustomExpense, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataExpense),
    });
  } catch (error) {
    console.error("Error updating custom expense:", error);
    // Optionally, provide user feedback or throw the error to be handled by the caller
    throw error;
  }
}


/**
 * Updates the custom income data for a specific user.
 * 
 * This function expects an object containing the income data to update.
 * 
 * @async
 * @function updateCustomIncome
 * @param {Object} dataIncome - The income data object to be updated.
 * @returns {Promise<Object>} A promise that resolves to the response object from the server.
 * @throws {Error} If there is an issue with the fetch request.
 */
async function updateCustomIncome(dataIncome) {
  try {
    // Make the POST request to update the custom income
    return await fetchData(API_ENDPOINTS.addCustomIncome, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataIncome),
    });
  } catch (error) {
    console.error("Error updating custom income:", error);
    // Optionally, provide user feedback or throw the error to be handled by the caller
    throw error;
  }
}

/**
 * Deletes custom data by sending a POST request to the server.
 * 
 * @async
 * @function deleteCustomData
 * @param {Object} data - The data to be deleted, formatted as a JSON object.
 * @returns {Promise<Object>} A promise that resolves with the server response after deleting the data.
 * @throws {Error} If there is an issue with the fetch operation.
 */
async function deleteCustomData(data) {
  try {
    // Send a POST request to delete the custom data
    return fetchData(API_ENDPOINTS.deleteData, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data), // Convert the data object to a JSON string
    });
  } catch (error) {
    // Log any errors that occur during the fetch operation
    console.error('An error occurred while deleting custom data:', error);
    throw error; // Re-throw the error to be handled by the calling function if necessary
  }
}

/**
 * Deletes a category for a specific user.
 * 
 * This function requires a `username` and a `category` for deletion. The expected data format is:
 * { username: "user123", category: "someCategory" }
 * 
 * @async
 * @function deleteCategory
 * @param {Object} data - The data object containing `username` and `category` to be deleted.
 * @param {string} data.username - The username of the user.
 * @param {string} data.category - The category to be deleted.
 * @returns {Promise<Object>} A promise that resolves to the response object from the server.
 * @throws {Error} If there is an issue with the fetch request.
 */
async function deleteCategory(data) {
  try {
    // Validate input
    if (!data.username || !data.category) {
      throw new Error('Invalid data: username and category are required.');
    }

    // Make the POST request to delete the category
    return await fetchData(API_ENDPOINTS.deleteCategory, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    // Optionally, provide user feedback or throw the error to be handled by the caller
    throw error;
  }
}

/**
 * Checks if a given category is already taken.
 * 
 * @async
 * @function categoryAvailableCheck
 * @param {string} categoryInput - The category name to check for availability.
 * @returns {Promise<number>} A promise that resolves to 1 if the category exists, 0 if it does not exist.
 * @throws {Error} If there is an issue fetching data from the database.
 */
// Function to check if a given category is already taken --- 1 = category exist, 0 == category does not exits
async function categoryAvailableCheck(categoryInput) {
  try {
    let data = await fetchDatabase(); //Fetches data from database
    let categories = Object.keys(data.customExpenses); //Accesses all category names in that budget
    // Iterate through the categories to check if the input category exists
    for (let i = 0; i < categories.length; i++) {
      if (categories[i] === categoryInput) {
        return 1;
      }
    } return 0;
  } catch (error) {
    console.error('An error occurred fetching categories from database:', error);
  }
}

/**
 * Fetches custom income data for the current month and year, processes it,
 * and returns an object with total income and goals for each category.
 *
 * @async
 * @function fetchAndProcessIncomeData
 * @returns {Promise<Object>} A promise that resolves to an object containing processed income data categorized by total income and goals.
 * @throws {Error} If there is an issue fetching income data or processing it.
 */
async function fetchAndProcessIncomeData() {
  try {
    // Use currentMonthIndex and currentYear from the global scope
    const month = String(currentMonthIndex + 1);
    const year = currentYear.toString();

    // Fetch custom incomes by month and year
    const incomes = await fetchCustomIncomesByMonthAndYear(username, month, year);
    const categoriesData = {};

    // Process the fetched incomes
    for (const category in incomes) {
      let totalIncome = 0;
      let goal = 0; // Default goal to 0 if not found

      incomes[category].forEach(item => {
        if (item.name === "##GOAL##") {
          goal = parseFloat(item.value);
        } else {
          totalIncome += parseFloat(item.amount);
        }
      });

      // Store the processed data in categoriesData object
      categoriesData[category] = { totalIncome, goal };
    }

    return categoriesData;
  } catch (error) {
    console.error("Error fetching and processing income data:", error);
    // Optionally, provide user feedback or throw the error to be handled by the caller
    throw error;
  }
}

/**
 * Fetches the history of expenses and incomes from the database, processes the data, 
 * and updates the history table with the entries.
 * 
 * @async
 * @function fetchHistory
 * @returns {Promise<void>} A promise that resolves when the history has been fetched and updated.
 * @throws {Error} If there is an issue fetching the data or updating the history.
 */
async function fetchHistory() {
  try {
    const data = await fetchDatabase();
    // Add names of all expense categories to an array
    const categoriesExpenses = data.customExpenses ? Object.keys(data.customExpenses) : []; // Add names of all categories to array
    let arrayOfHistories = [];

    // Get name, price, category and timestamp for each expense in database
    categoriesExpenses.forEach(category => {
      data.customExpenses[category].forEach(expense => {    // Iterate over the expenses array directly
        if (expense.name == '##GOAL##') {   // Exclude first entry in database containing the category goal
          return;
        }

        // Add the category to the expense object
        expense.category = category;
        // Add the expense object to the array of histories
        arrayOfHistories.push(expense);   // Add object to array

      });
    });

    // Get name, price, category and timestamp for each income in database
    const categoriesIncomes = data.customIncomes ? Object.keys(data.customIncomes) : [];
    categoriesIncomes.forEach(category => {
      data.customIncomes[category].forEach(income => {  // Iterate over the incomes array directly
        if (income.name == '##GOAL##') {   // Exclude first entry in database containing the category goal
          return;
        }

        income.category = category;
        arrayOfHistories.push(income);   // Add object to array
      });
    });
    // Sort the array of histories by date 
    arrayOfHistories.sort((a, b) => new Date(b.date) - new Date(a.date));  // Sort array after timestamp

    // Create table for each income and expense entry in the database
    arrayOfHistories.forEach(history => {   // Create table for each income and expense entry in database
      createTable(history, history.category, 0);
    });

  } catch (error) {
    console.log('Error trying to fetch history: ', error);
  }
}

/**
 * Fetches custom expenses for a specific user by month and year.
 * 
 * @async
 * @function fetchCustomExpensesByMonthAndYear
 * @param {string} username - The username of the user.
 * @param {number} month - The month for which to fetch expenses.
 * @param {number} year - The year for which to fetch expenses.
 * @returns {Promise<Object>} A promise that resolves to the fetched custom expenses data.
 * @throws {Error} If there is an issue with the fetch request.
 */
async function fetchCustomExpensesByMonthAndYear(username, month, year) {
  try {
    // Construct the URL by replacing placeholders with actual values
    const url = API_ENDPOINTS.fetchCustomExpensesByMonthAndYear
      .replace(':username', username)
      .replace(':month', month)
      .replace(':year', year);

    // Make the GET request to fetch custom expenses
    return await fetchData(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching custom expenses by month and year:", error);
    // Optionally, provide user feedback or throw the error to be handled by the caller
    throw error;
  }
}

/**
 * Fetches custom incomes for a specific user by month and year.
 * 
 * @async
 * @function fetchCustomIncomesByMonthAndYear
 * @param {string} username - The username of the user.
 * @param {number} month - The month for which to fetch incomes.
 * @param {number} year - The year for which to fetch incomes.
 * @returns {Promise<Object>} A promise that resolves to the fetched custom incomes data.
 * @throws {Error} If there is an issue with the fetch request.
 */
async function fetchCustomIncomesByMonthAndYear(username, month, year) {
  try {
    // Construct the URL by replacing placeholders with actual values
    const url = API_ENDPOINTS.fetchCustomIncomesByMonthAndYear
      .replace(':username', username)
      .replace(':month', month)
      .replace(':year', year);

    // Make the GET request to fetch custom incomes
    return await fetchData(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching custom incomes by month and year:", error);
    // Optionally, provide user feedback or throw the error to be handled by the caller
    throw error;
  }
}

//#####################
// UI Updates
//##################### 
/**
 * Updates the user values view by fetching the monthly budget, custom expense data, and custom income data,
 * then calculates and displays the total expenses, income, and available amount.
 * 
 * @async
 * @function updateUserValuesView
 * @returns {Promise<void>} A promise that resolves when the user values view has been updated.
 * @throws {Error} If there is an issue fetching data or updating the view.
 */
async function updateUserValuesView() {
  try {
    const currentMonth = String(currentMonthIndex + 1);
    // Use currentYear directly without redeclaring it
    const yearString = currentYear.toString();
    const monthlyBudget = await fetchMonthlyBudget(currentMonth, yearString);
    // Fetch and process custom expense data
    const customExpenseData = await fetchAndProcessCategoryData();
    const customIncomeData = await fetchAndProcessIncomeData();

    let totalCustomExpense = 0;
    let totalCustomIncome = 0;

    // Calculate the total custom expenses
    Object.entries(customExpenseData).forEach(([category, items]) => {
      totalCustomExpense += items.totalExpense;
    });

    Object.entries(customIncomeData).forEach(([category, items]) => {
      totalCustomIncome += items.totalIncome;
    });
    // Calculate the net expenses
    let netExpenses = (monthlyBudget.expenses + totalCustomExpense);
    // Update the tooltip with the total expenses and income
    toolTip.textContent = "Total: " + (netExpenses + monthlyBudget.savings) + " / " + (monthlyBudget.income + totalCustomIncome);
    totalAmount.textContent = "Monthly Income: " + monthlyBudget.income;
    spentAmount.textContent = "Net expenses: " + netExpenses;
    leftAmount.textContent = "Available: " + (monthlyBudget.income - netExpenses - monthlyBudget.savings + totalCustomIncome);
    savingsAmount.textContent = "Savings: " + monthlyBudget.savings;
    setPiePercentage(((netExpenses + monthlyBudget.savings) / (monthlyBudget.income + totalCustomIncome) * 100), pie);

  } catch (error) {
    console.error("Error: ", error);
  }
}

/**
 * Updates the history by fetching data from the database and creating table rows for the specified category.
 * 
 * @async
 * @function updateHistory
 * @param {string} category - The category to update (either an expense or income category).
 * @returns {Promise<void>} A promise that resolves when the history has been updated.
 * @throws {Error} If there is an issue fetching data or updating the history.
 */
async function updateHistory(category) {
  try {
    const data = await fetchDatabase();
    // Add names of all expense categories to array
    const categoriesExpenses = data.customExpenses ? Object.keys(data.customExpenses) : []; // Add names of all categories to array
    const categoriesIncomes = data.customIncomes ? Object.keys(data.customIncomes) : []; // Add names of all categories to array

    // Update expenses
    if (categoriesExpenses.includes(category)) {        // Checks if the category exsists
      const expenses = data.customExpenses[category];   // Put array of expenses in category into variable
      if (expenses.length > 0) {
        const lastExpense = expenses[expenses.length - 1];

        createTable(lastExpense, category, 1); // 1 for true means new input
      } else {
        console.log('No expenses in this category yet.');
      }
    } else {
      console.log('Category (expense) not found. Must likely because this is an income instead');
    }

    // Update incomes
    if (categoriesIncomes.includes(category)) {        // Checks if the category exsists
      const incomes = data.customIncomes[category];   // Put array of expenses in category into variable
      if (incomes.length > 0) {
        const lastIncome = incomes[incomes.length - 1]; // Get the last income entry
        createTable(lastIncome, category, 1);
      } else {
        console.log('No expenses in this category yet.');
      }
    } else {
      console.log('Category (income) not found. Must likely because this is an expense instead');
    }
  } catch (error) {
    console.error('Error updating history:', error);
  }
}
/**
 * Refreshes the history table by removing all current elements, updating the categories and user values,
 * and fetching the updated history data.
 * 
 * @async
 * @function refreshHistory
 * @returns {Promise<void>} A promise that resolves when the history has been refreshed.
 * @throws {Error} If there is an issue updating categories, user values, or fetching history.
 */
async function refreshHistory() {
  try {
    // Select all elements currently in the history table
    const allTableElements = table.querySelectorAll('p, tr, td, button, dialog, h3, input, div'); // Q-Select all elements currently in the table

    // Remove each element found
    allTableElements.forEach(element => {
      element.remove();
    });

    // Fetch and update category data
    await updateCategory();
    // Update the UI with current user values
    await updateUserValuesView();
    // Fetch and display updated history data
    await fetchHistory();
  } catch (error) {
    console.error("Error refreshing history:", error);
    // Optionally, provide user feedback
    alert("An error occurred while refreshing the history. Please try again.");
  }
}

/**
 * Refreshes the categories section by removing all current elements, fetching updated categories,
 * and refreshing the history table to reflect any changes in categories.
 * 
 * @async
 * @function refreshCategories
 * @returns {Promise<void>} A promise that resolves when the categories have been refreshed.
 * @throws {Error} If there is an issue fetching categories or refreshing the history.
 */
async function refreshCategories() {
  try {
    // Select all elements currently in the categories section
    const allCategoryElements = categories.querySelectorAll('div, span, p'); // Q-Select all elements currently in the table

    // Remove each element found
    allCategoryElements.forEach(element => {
      element.remove();
    });

    // Fetch and display updated categories
    await fetchCategories();
    // Refresh the history table to reflect any changes in categories
    await refreshHistory();
  } catch (error) {
    console.error("Error refreshing categories:", error);
    // Optionally, provide user feedback
    alert("An error occurred while refreshing the categories. Please try again.");
  }
}

//#####################
// HISTORY TABLE
//#####################
/**
 * Creates a table row for the given data and category, and sets up editing functionality.
 *
 * @param {Object} data - The data object containing name, amount, date, _id, and category.
 * @param {string} category - The category of the data (e.g., 'Income', 'Expense').
 * @param {number} [newOrOld=0] - Flag to indicate if the entry is new (1) or old (0).
 */
function createTable(data, category, newOrOld = 0) {  // data formated as {name, amount, date, _id, category}
  let simpleDate = new Date(data.date).toDateString().slice(4);    // Slice to remove the name of the day

  //#######################
  // CREATE TABLE ELEMENTS
  //#######################
  // Create the first row for the history window
  const row1 = document.createElement('tr');

  const expenseName = document.createElement('td');
  const expensePrice = document.createElement('td');
  // Set the expense name
  expenseName.textContent = data.name;

  // If the category is not 'Income', display the amount as negative and in red
  if (!(category === 'Income')) {
    expensePrice.textContent = '-' + data.amount + ' DKK';
    expensePrice.style.color = '#CC3333'; // Add this line to set the text color to red
  } else {
    expensePrice.textContent = data.amount + ' DKK';
  }
  // Append the expense name and price to the first row
  row1.appendChild(expenseName);
  row1.appendChild(expensePrice);

  // Builds row 2 for the history window 
  const row2 = document.createElement('tr');

  const expenceCategory = document.createElement('td');
  const historyExpenseEdit = document.createElement('td');
  const editBtn = document.createElement('button');
  const deleteBtn = document.createElement('button');

  // Set the expense category text and date
  expenceCategory.textContent = category + ' - ' + simpleDate;
  editBtn.textContent = 'Edit';
  deleteBtn.textContent = 'Delete';
  // Add classes for styling
  editBtn.classList.add('editHistory');
  deleteBtn.classList.add('editHistory');
  historyExpenseEdit.classList.add('historyBtns');
  // Append the edit and delete buttons to the second row
  historyExpenseEdit.appendChild(editBtn);
  historyExpenseEdit.appendChild(deleteBtn);
  row2.appendChild(expenceCategory);
  row2.appendChild(historyExpenseEdit);

  // Prepend or append the rows to the table based on newOrOld flag
  if (newOrOld) {   // If true == new
    table.prepend(row2);  // Add the second row to the beginning of the table
    table.prepend(row1);
  } else {
    table.appendChild(row1);  // Add the first row to the end of the table
    table.appendChild(row2);
  }

  //############################
  // CREATE DIALOGS AND BUTTONS
  //############################
  // Create dialog element for editing history
  const editHistoryDialog = document.createElement('dialog');
  editHistoryDialog.classList.add('edit-history');

  // Create and append heading for the dialog
  const editHistoryHeading = document.createElement('h3');
  editHistoryHeading.textContent = 'Edit history';
  editHistoryDialog.appendChild(editHistoryHeading);

  // Create paragraph for "Edit name" text and input
  const editNameParagraph = document.createElement('p');
  editNameParagraph.textContent = 'Edit name';
  editHistoryDialog.appendChild(editNameParagraph);

  const nameInput = document.createElement('input');
  nameInput.setAttribute('type', 'text');
  nameInput.classList.add('name-edit-history');
  nameInput.style.float = 'right';
  editNameParagraph.appendChild(nameInput);

  // Create paragraph for "Edit value" text and input
  const editValueParagraph = document.createElement('p');
  editValueParagraph.textContent = 'Edit value';
  editHistoryDialog.appendChild(editValueParagraph);
  const valueInput = document.createElement('input');

  valueInput.setAttribute('type', 'text');
  valueInput.classList.add('value-edit-history');
  valueInput.style.float = 'right';
  editValueParagraph.appendChild(valueInput);

  // Create div for buttons
  const buttonDiv = document.createElement('div');
  buttonDiv.classList.add('buttons');
  editHistoryDialog.appendChild(buttonDiv);

  // Create close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'CLOSE';
  closeButton.classList.add('close-btn-history-edit');
  buttonDiv.appendChild(closeButton);

  // Create save button
  const saveButton = document.createElement('button');
  saveButton.textContent = 'SAVE';
  saveButton.classList.add('save-btn-history-edit');
  buttonDiv.appendChild(saveButton);

  // Append dialog to body
  document.body.appendChild(editHistoryDialog);

  //#################################
  // ADD EVENT LISTERNERS TO BUTTONS
  //#################################
  // Add functionality to the "edit" button to show the dialog
  editBtn.addEventListener('click', async () => {
    editHistoryDialog.showModal();
  });
  // Close the dialog when the close button is clicked
  closeButton.onclick = async () => {
    editHistoryDialog.close();
  };
  // Save changes when the save button is clicked
  saveButton.onclick = async () => {
    // Validate the input value
    if (isNaN(valueInput.value)) {
      alert("Please enter valid numbers for value.");
      return; // Exit function if any input is not a number
    }
    // Convert negative values to positive
    if (valueInput.value < 0) {
      valueInput.value *= (-1);
    }

    //If user should enter a negative number, it will be converted
    if (valueInput.value < 0) {
      valueInput.value = valueInput.value * (-1);
    }

    // Prepare data package for deletion
    let dataPackage = {
      username: username,
      category: category,
      customData: [data],
    }
    await deleteCustomData(dataPackage);

    editHistoryDialog.close();  // Close dialog

    // Create new data object with updated values
    if (!(category === "Income")) {
      let newExpenseData = {
        username: username,
        category: category,
        customExpense: [data],
      };
      // Get new name and value from input fields
      let newName = nameInput.value
      let newValue = valueInput.value

      if (newName) {
        newExpenseData.customExpense[0].name = newName;
      }
      if (newValue) {
        newExpenseData.customExpense[0].amount = newValue;
      }

      await updateCustomExpense(newExpenseData) // Update the custom expense
    } else {
      let newIncomeData = {
        username: username,
        category: category,
        customIncome: [data],
      };

      let newName = nameInput.value
      let newValue = valueInput.value

      if (newName) {
        newIncomeData.customIncome[0].name = newName;
      }

      if (newValue) {
        newIncomeData.customIncome[0].amount = newValue;
      }

      await updateCustomIncome(newIncomeData) // Update the custom income
    }

    await refreshHistory();
  };

  // Adds funcunality to the "delete" button
  deleteBtn.addEventListener('click', async () => {
    const confirmation = window.confirm(`Are you sure you want to delete the entry "${data.name}"?`);
    // If the user confirms, prepare the data package for deletion
    if (confirmation) {
      let dataPackage = {
        username: username,
        category: category,
        customData: [data],
      }
      // Call the function to delete the custom data
      await deleteCustomData(dataPackage);
      // Refresh the history view after deletion
      await refreshHistory();
    } else {
      console.log("User cancelled deletion");
    }
  });
}

//#####################
// EVENT HANDLERS
//##################### 
/**
 * Sets up event listeners for various UI elements and handles user interactions.
 * @async
 */
async function setupEventListeners() {
  // Event listener for showing the fixed budget popup
  document.querySelector('.show-popup-fixed').onclick = () => {
    document.querySelector('.popup-container-fixed').classList.add("active");
  };

  // Event listener for closing the fixed budget popup
  document.querySelector('.close-btn-fixed').onclick = () => {
    document.querySelector('.popup-container-fixed').classList.remove("active");
  };

  // Event listener for saving the fixed budget values
  document.querySelector('.save-btn-fixed').onclick = async () => {
    try {
      const incomeFixed = document.querySelector(".income-fixed");
      const expenseFixed = document.querySelector(".expense-fixed");
      const savingsFixed = document.querySelector(".savings-fixed");

      // Validate inputs
      if (incomeFixed.value == '' || expenseFixed.value == '' || savingsFixed.value == '') {
        alert("Please enter numbers in all number-fields");
        return; // Exit function if any input is empty
      }

      if (isNaN(incomeFixed.value) || isNaN(expenseFixed.value) || isNaN(savingsFixed.value)) {
        alert("Please enter valid numbers for income, expenses, and savings.");
        return; // Exit function if any input is not a number
      }

      // Convert negative numbers to positive, except for savings
      if ((incomeFixed.value) < 0) {
        incomeFixed.value *= (-1);
      }
      if ((expenseFixed.value) < 0) {
        expenseFixed.value *= (-1);
      }

      let incomeVal = incomeFixed.value;
      let expenseVal = expenseFixed.value;
      let savingsVal = savingsFixed.value;

      // Assuming currentMonthIndex and currentYear are already defined
      let month = currentMonthIndex + 1; // JavaScript months are 0-indexed, add 1 for consistency with common representations
      let year = currentYear;

      let data = {
        username, // Ensure username is correctly defined or fetched from a reliable source, e.g., session storage or a global variable
        month: month,
        year: year,
        income: incomeVal,
        expenses: expenseVal,
        savings: savingsVal,
      };

      // Save the monthly budget
      await saveMonthlyBudget(month, year, incomeVal, expenseVal, savingsVal)
        .then(() => {
          // Handle success
          console.log("Monthly budget updated successfully.");
          updateUserValuesView(); // Update the UI to reflect the new budget values
        })
        .catch(error => {
          // Handle error
          console.error("Error updating monthly budget:", error);
        });

      // Close the popup and reset input fields
      document.querySelector('.popup-container-fixed').classList.remove("active");
      incomeFixed.value = localStorage.getItem('incomeFixed') || '';
      expenseFixed.value = localStorage.getItem('expenseFixed') || '';
      savingsFixed.value = localStorage.getItem('savingsFixed') || '';
    } catch (error) {
      console.error("Error in save-btn-fixed click handler:", error);
    }
  };

  // Event listener for showing the income popup
  document.querySelector('.show-popup-income').onclick = async () => {
    try {
      const month = currentMonthIndex + 1; // JavaScript months are 0-indexed, add 1 for consistency
      const year = currentYear;
      const monthlyBudget = await fetchMonthlyBudget(month, year);
      const incomeFixed = document.querySelector(".income-fixed");
      const expenseFixed = document.querySelector(".expense-fixed");
      const savingsFixed = document.querySelector(".savings-fixed");

      // Prefill the popup with monthly budget values
      incomeFixed.value = monthlyBudget.income || 0;
      expenseFixed.value = monthlyBudget.expenses || 0;
      savingsFixed.value = monthlyBudget.savings || 0;

      if (incomeFixed.value == '0' && expenseFixed.value == '0' && savingsFixed.value == '0') {
        alert("Please set up monthly income and expenses first in the primary budget overview");
        return;
      } else {
        document.querySelector('.popup-container-income').classList.add("active");
      }
    } catch (error) {
      console.error("Error in show-popup-income click handler:", error);
    }
  };

  // Event listener for closing the income popup
  document.querySelector('.close-btn-income').onclick = () => {
    document.querySelector('.popup-container-income').classList.remove("active");
  };

  // Event listener for saving the custom income entry
  document.querySelector('.save-btn-income').onclick = async () => {
    try {
      const valueCustomIncome = document.querySelector(".value-income");

      // Validate input
      if (isNaN(valueCustomIncome.value)) {
        alert("Please enter valid number for the income.");
        return; // Exit function if input is not a number
      }

      let name = document.querySelector(".name-income").value;

      // Convert negative number to positive
      let value = valueCustomIncome.value;
      if (value < 0) {
        value = value * -1;
      }

      let date = getFormattedDate();
      let id = Date.now().toString();

      let items = [{ "name": name, "amount": value, "date": date, "_id": id }];

      let dataIncome = {
        username,
        customIncome: items,
        category: "Income",
      };

      // Close the popup and update the UI
      document.querySelector('.popup-container-income').classList.remove("active");
      await updateCustomIncome(dataIncome);
      await updateUserValuesView();
      await updateHistory('Income');

      // Clear input fields
      valueCustomIncome.value = "";
    } catch (error) {
      console.error("Error in save-btn-income click handler:", error);
    }
  };

  // Event listener for showing the expense popup
  document.querySelector('.show-popup-expense').onclick = async () => {
    try {
      await dropDownFetchCategories(document.querySelector('.dropdown-edit'));
      const data = await fetchDatabase(); // Fetch data from the database
      const month = currentMonthIndex + 1; // JavaScript months are 0-indexed, add 1 for consistency
      const year = currentYear;
      const monthlyBudget = await fetchMonthlyBudget(month, year);
      const incomeFixed = document.querySelector(".income-fixed");
      const expenseFixed = document.querySelector(".expense-fixed");
      const savingsFixed = document.querySelector(".savings-fixed");

      // Prefill the popup with monthly budget values
      incomeFixed.value = monthlyBudget.income || 0;
      expenseFixed.value = monthlyBudget.expenses || 0;
      savingsFixed.value = monthlyBudget.savings || 0;

      if (incomeFixed.value == '0' && expenseFixed.value == '0' && savingsFixed.value == '0') {
        alert("Please set up monthly income and expenses first in the primary budget overview");
        return;
      }

      if (!data.customExpenses || Object.keys(data.customExpenses).length === 0) {
        alert("No category found. Please create category first.");
        return;
      } else {
        document.querySelector('.popup-container-expense').classList.add("active");
        await dropDownFetchCategories(document.querySelector('.dropdown-expense'));
      }
    } catch (error) {
      console.error("Error in show-popup-expense click handler:", error);
    }
  };

  // Event listener for closing the expense popup
  document.querySelector('.close-btn-expense').onclick = () => {
    document.querySelector('.popup-container-expense').classList.remove("active");
  };

  // Event listener for saving the custom expense entry
  document.querySelector('.save-btn-expense').onclick = async () => {
    try {
      const nameCustomExpense = document.querySelector(".name-expense");
      const valueCustomExpense = document.querySelector(".value-expense");
      const dropdownExpense = document.querySelector(".dropdown-expense");
      const category = dropdownExpense.value;

      // Validate input
      if (isNaN(valueCustomExpense.value)) {
        alert("Please enter valid number for expenses.");
        return; // Exit function if input is not a number
      }

      let value = valueCustomExpense.value;

      // Convert negative number to positive
      if (value < 0) {
        value = value * -1;
      }

      let name = nameCustomExpense.value;
      let date = getFormattedDate();
      let id = Date.now().toString();

      let items = [{ "name": name, "amount": value, "date": date, "_id": id }];

      let dataExpense = {
        username,
        customExpense: items,
        category: category,
      };

      // Close the popup and update the UI
      document.querySelector('.popup-container-expense').classList.remove("active");
      await updateCustomExpense(dataExpense);
      await updateCategory();
      await updateUserValuesView();
      await updateHistory(category);

      // Clear input fields
      nameCustomExpense.value = "";
      valueCustomExpense.value = "";
    } catch (error) {
      console.error("Error in save-btn-expense click handler:", error);
    }
  };

  // Global event listener for handling Enter key to save and close popups
  document.addEventListener('keydown', (event) => {
    try {
      if (event.key === 'Enter') {
        if (document.querySelector('.popup-container-fixed').classList.contains('active')) {
          document.querySelector('.save-btn-fixed').click();
        } else if (document.querySelector('.popup-container-income').classList.contains('active')) {
          document.querySelector('.save-btn-income').click();
        } else if (document.querySelector('.popup-container-expense').classList.contains('active')) {
          document.querySelector('.save-btn-expense').click();
        } else if (document.querySelector('.add-category-dialog').classList.contains('active')) {
          document.querySelector('.save-btn-category').click();
        } else if (document.querySelector('.edit-category-dialog').classList.contains('active')) {
          document.querySelector('.save-btn-category-edit').click();
        }
      }
    } catch (error) {
      console.error("Error handling Enter key event:", error);
    }
  });
}



// Save to localStorage on input change
incomeFixed.addEventListener('input', function () {
  localStorage.setItem('incomeFixed', this.value);
});

expenseFixed.addEventListener('input', function () {
  localStorage.setItem('expenseFixed', this.value);
});

savingsFixed.addEventListener('input', function () {
  localStorage.setItem('savingsFixed', this.value);
});

//#####################
// CALENDAR FUNCTIONALITY
//#####################
// document.querySelector('.show-calendar-popup').onclick = async () => {
//   document.querySelector('.popup-container-calendar').classList.add('active');
//   await generateCalendar();
// };

// const closeCalendarPopup = document.querySelector('.close-calendar-popup');
// if (closeCalendarPopup) {
//   closeCalendarPopup.onclick = async () => {
//     const popupContainerCalendar = document.querySelector('.popup-container-calendar');
//     if (popupContainerCalendar) {
//       popupContainerCalendar.classList.remove('active');
//     }
//   };
// }

// async function generateCalendar() {
//   const container = document.querySelector('.popup-container-calendar');
//   // Clear previous calendar
//   container.innerHTML = '';
//   const calendar = document.createElement('div');
//   calendar.className = 'calendar';

//   // Generate days here based on the current month
//   const currentDate = new Date();
//   // Get the number of days in the current month
//   const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
//   console.log(daysInMonth);
//   for (let day = 1; day <= daysInMonth; day++) {
//     const dayElement = document.createElement('div');
//     dayElement.className = 'day';
//     dayElement.textContent = day;
//     dayElement.onclick = () => alert(`Clicked on day ${day}`);
//     calendar.appendChild(dayElement);
//   }

//   container.appendChild(calendar);
// }

//#####################
// MONTH NAVIGATION
//#####################
// JavaScript months are 0-indexed
// Define global variables


document.addEventListener('DOMContentLoaded', async () => {
  // Array of month names for display purposes
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let currentMonthName = monthNames[currentMonthIndex];
  // "#" = id and "." = class
  // Select the previous month button, current month span, and next month button 
  const prevMonthButton = document.querySelector('#prevMonth');
  const currentMonthSpan = document.querySelector('#currentMonth');
  const nextMonthButton = document.querySelector('#nextMonth');
  // Function to update the displayed month and year
  async function updateMonthDisplay() {
    currentMonthName = monthNames[currentMonthIndex];
    currentMonthSpan.textContent = currentMonthName + ' ' + currentYear;
  }
  // Initial call to update the month display
  await updateMonthDisplay();
  // Event listener for the previous month button
  prevMonthButton.addEventListener('click', async () => {
    if (currentMonthIndex === 0) {
      currentMonthIndex = 11; // Move to December of the previous year
      currentYear -= 1; // Move to the previous month
    } else {
      currentMonthIndex -= 1;
    }
    await updateMonthDisplay();
    await updateUserValuesView(); // Update the user values view for the new month
    await updateCategory(); // Update the category view for the new month
  });
  // Event listener for the next month button
  nextMonthButton.addEventListener('click', async () => {
    if (currentMonthIndex === 11) {
      currentMonthIndex = 0; // Move to January of the next year
      currentYear += 1;
    } else {
      currentMonthIndex += 1; // Move to the next month
    }
    await updateMonthDisplay();
    await updateUserValuesView();
    await updateCategory();
  });
});
/**
 * Fetches the monthly budget data from the server.
 * 
 * @async
 * @function fetchMonthlyBudget
 * @param {number} month - The month for which to fetch the budget data (0-11).
 * @param {number} year - The year for which to fetch the budget data.
 * @returns {Promise<Object>} The monthly budget data fetched from the server.
 * @throws {Error} If the fetch operation fails.
 */
async function fetchMonthlyBudget(month, year) {
  const url = API_ENDPOINTS.fetchMonthlyBudget.replace(':month', month).replace(':year', year);
  return fetchData(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}


/**
 * Updates the budget view with the fetched data for the specified month and year.
 * Work in progress TODO
 * @async
 * @function updateBudgetView
 * @param {number} month - The month for which to update the budget view (0-11).
 * @param {number} year - The year for which to update the budget view.
 * @returns {Promise<void>} A promise that resolves when the budget view has been updated.
 * @throws {Error} If the fetch operation or data update fails.
 */

async function updateBudgetView(month, year) {
  const monthlyBudget = await fetchMonthlyBudget(month, year);
  if (monthlyBudget.income > 0) {
    incomeFixed.value = monthlyBudget.income;
  }
  if (monthlyBudget.expenses > 0) {
    expenseFixed.value = monthlyBudget.expenses;
  }
  if (monthlyBudget.savings > 0) {
    savingsFixed.value = monthlyBudget.savings;
  }
}
/**
 * Saves the monthly budget data to the server.
 * 
 * @async
 * @function saveMonthlyBudget
 * @param {number} month - The month for which to save the budget data (0-11).
 * @param {number} year - The year for which to save the budget data.
 * @param {number} income - The income value to be saved.
 * @param {number} expenses - The expenses value to be saved.
 * @param {number} savings - The savings value to be saved.
 * @returns {Promise<Object>} A promise that resolves with the server response after saving the budget data.
 * @throws {Error} If the fetch operation fails.
 */
async function saveMonthlyBudget(month, year, income, expenses, savings) {
  const data = { month, year, income, expenses, savings };
  return fetchData(API_ENDPOINTS.updateMonthlyBudget, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

/**
 * This function highlights buttons in a sequence as part of a tutorial.
 * @param {HTMLElement[]} buttons - An array of buttons to highlight in sequence.
 */
function glowButton(buttons) {
  let current = 0; // Track the current button in the sequence
  let colorPicked = false; // Track if a color picker has been used
  const progressBar = document.querySelector('.progress-bar-fill'); // Get the progress bar fill element
  const progressContainer = document.querySelector('.progress-bar'); // Get the progress bar container
  const progressLabel = document.querySelector('.progress-label'); // Get the progress label

  // Update the progress bar based on the current step
  const updateProgressBar = () => {
    const progressPercentage = Math.round((current / (buttons.length - 3)) * 100);
    progressBar.style.width = `${progressPercentage}%`;
    progressBar.textContent = progressPercentage + '%'; // Display the progress percentage

    if (progressPercentage === 100) {
      progressBar.textContent = 'Tutorial Completed'; // Change text when tutorial is complete
      progressContainer.style.display = 'none'; // Hide the progress bar when the tutorial is complete
      progressLabel.style.display = 'none'; // Hide the progress label when the tutorial is complete
    }
  };

  // Initially disable all non-input buttons
  buttons.forEach(button => {
    if (button.tagName !== 'INPUT') {
      button.disabled = true;
    }
  });

  // Move to the next button in the sequence
  const nextButton = () => {
    // Update the progress bar
    updateProgressBar();

    // Disable and remove the glow effect from the previous button
    if (current > 0) {
      if (buttons[current - 1].tagName !== 'INPUT') {
        buttons[current - 1].disabled = true; // Disable the previous button if it's not an input
      }
      buttons[current - 1].classList.remove('glow-effect'); // Remove glow from the previous button
    }
    // Highlight the current button and enable it
    if (current < buttons.length - 3) {
      buttons[current].disabled = false; // Enable the current button
      buttons[current].classList.add('glow-effect'); // Add glow to current button
      if (buttons[current].tagName === 'INPUT') {
        if (buttons[current].type === 'color') {
          buttons[current].removeEventListener('input', handleColorPicker);
          buttons[current].addEventListener('input', handleColorPicker);
        } else if (buttons[current].classList.contains('category-name') || buttons[current].classList.contains('name-expense') || buttons[current].classList.contains('name-income') || buttons[current].classList.contains('name-edit')) {
          buttons[current].removeEventListener('input', handleInput);
          buttons[current].addEventListener('input', handleFreeTextInput);
        } else {
          buttons[current].addEventListener('input', handleInput);
        }
      } else {
        buttons[current].addEventListener('click', handleClick);
      }
    } else {
      // Re-enable all buttons and remove tutorial flag when tutorial is completed normally
      buttons.forEach(button => {
        button.disabled = false;
        button.classList.remove('glow-effect');
      });
      localStorage.removeItem('startTutorial'); // Ensure tutorial does not reactivate on login
      document.querySelector('.skip-tutorial-btn').style.display = 'none'; // Hide skip button
      progressContainer.style.display = 'none'; // Hide progress bar
      progressLabel.style.display = 'none'; // Hide progress label
      alert('Tutorial completed. You can now start using Studie Budget. \nIn case you get stuck, please visit the help page.');
      window.location.reload(); // Reload the page
    }
  };

  const handleInput = () => {
    if (buttons[current].value.trim() !== '' && !isNaN(buttons[current].value)) {
      current++;
      setTimeout(nextButton, 500); // Add a delay of 500ms
    }
  };

  const handleFreeTextInput = () => {
    if (buttons[current].value.trim() !== '') {
      current++;
      setTimeout(nextButton, 500); // Add a delay of 500ms
    }
  };

  const handleColorPicker = (event) => {
    if (!colorPicked) {
      colorPicked = true;
      current++;
      nextButton();
    }
  };

  const handleClick = () => {
    current++;
    nextButton();
  };

  nextButton(); // Start the sequence
}

// Wait for the DOM to be loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check URL for the startTutorial query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const startTutorial = urlParams.get('startTutorial');
  const skipButton = document.querySelector('.skip-tutorial-btn'); // Get the skip button
  const progressContainer = document.querySelector('.progress-bar'); // Get the progress bar container
  const progressLabel = document.querySelector('.progress-label'); // Get the progress label

  // If the startTutorial parameter is present in the URL, save it in localStorage and remove it from the URL
  if (startTutorial === 'true') {
    localStorage.setItem('startTutorial', 'true');
    history.replaceState(null, '', location.pathname);
  }
  // Check if the tutorial should be active based on localStorage
  if (localStorage.getItem('startTutorial') === 'true') {
    alert(`Welcome to Studie Budget \n\nFollow the glow to complete the tutorial or press the skip tutorial button to skip the tutorial.`);
    skipButton.style.display = 'block'; // Show skip button only if tutorial is active
    progressContainer.style.display = 'block'; // Show progress bar only if tutorial is active
    progressLabel.style.display = 'block'; // Show progress label only if tutorial is active

    // List of buttons to be highlighted in the tutorial
    const buttons = [
      document.querySelector('.show-popup-fixed'),
      document.querySelector('.income-fixed'),
      document.querySelector('.expense-fixed'),
      document.querySelector('.savings-fixed'),
      document.querySelector('.save-btn-fixed'),
      document.querySelector('.add-circle'),
      document.querySelector('.category-name'),
      document.querySelector('.category-goal'),
      document.querySelector('.category-color'),
      document.querySelector('.save-btn-category'),
      document.querySelector('.show-popup-expense'),
      document.querySelector('.dropdown-expense'),
      document.querySelector('.name-expense'),
      document.querySelector('.value-expense'),
      document.querySelector('.save-btn-expense'),
      document.querySelector('.show-popup-income'),
      document.querySelector('.name-income'),
      document.querySelector('.value-income'),
      document.querySelector('.save-btn-income'),
      document.querySelector('.show-edit-categories'),
      document.querySelector('.dropdown-edit'),
      document.querySelector('.name-edit'),
      document.querySelector('.goal-edit'),
      document.querySelector('.save-btn-category-edit'),
      // Close buttons should not run in tutorial
      document.querySelector('.close-btn-fixed'),
      document.querySelector('.close-btn-category'),
      document.querySelector('.close-btn-category-edit'),
    ];

    glowButton(buttons);

    // Event listener for the skip button
    skipButton.addEventListener('click', () => {
      localStorage.removeItem('startTutorial'); // Remove the tutorial flag
      // Hide the tutorial UI elements
      skipButton.style.display = 'none'; // Hide skip button
      progressContainer.style.display = 'none'; // Hide progress bar
      progressLabel.style.display = 'none'; // Hide progress label
      window.location.reload(); // Reload the page
    });
  } else {
    // Hide tutorial elements if the tutorial is not active
    skipButton.style.display = 'none'; // Hide skip button if not in tutorial
    progressContainer.style.display = 'none'; // Hide progress bar if not in tutorial
    progressLabel.style.display = 'none'; // Hide progress label if not in tutorial
  }
});

// Additional event listener for the skip button to ensure the tutorial flag is removed and styles reset
document.querySelector('.skip-tutorial-btn').addEventListener('click', () => {
  localStorage.removeItem('startTutorial'); // Remove the tutorial flag from localStorage
  // Optionally, reset any tutorial-specific styles or states
  document.querySelectorAll('.glow-effect').forEach(button => {
    button.classList.remove('glow-effect');
  });
  // Hide the tutorial UI elements or redirect the user
  document.querySelector('.progress-bar').style.display = 'none'; // Hide progress bar
  document.querySelector('.progress-label').style.display = 'none'; // Hide progress label
  window.location.reload(); // Reload the page or redirect as needed
});

//#####################
// INITIALIZATION
//##################### 
async function initialize() {
  currentYear = new Date().getFullYear(); // Ensure currentYear is set
  await setupEventListeners();
  await updateBudgetView(currentMonth, currentYear);
  await updateUserValuesView();
  await fetchCategories();
  await fetchHistory();
}

// Call initialize to start the app
initialize();
