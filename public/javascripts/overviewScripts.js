//#####################
// Constants and Configuration
//#####################
const body = document.querySelector('body');
const pie = document.querySelector('.pie');
let currentYear = new Date().getFullYear();
let currentMonthIndex = new Date().getMonth();
const totalAmount = document.querySelector(".total");
const spentAmount = document.querySelector(".spent");
const leftAmount = document.querySelector(".left");
const savingsAmount = document.querySelector(".savings");

const API_ENDPOINTS = {
  fetchBudget: "/api/budget/:budgetID",
  addCustomExpense: "/api/addcustom/expense",
  addCustomIncome: "/api/addcustom/income",
  deleteData: "/api/deletecustom",
  fetchCustomExpensesByMonthAndYear: "/api/customexpenses/:month/:year",
  fetchMonthlyBudget: "/api/monthlybudget/:month/:year", // Added new API endpoint for fetching monthly budget
  updateMonthlyBudget: "/api/update_monthly_budget", // Added new API endpoint for updating monthly budget
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
// const editHistoryDialog = document.querySelector('.edit-history');
// const editHistoryName = document.querySelector('.name-edit-history');
// const editHistoryValue = document.querySelector('.value-edit-history');
// const closeBtnEditHistory = document.querySelector('.close-btn-history-edit');
// const saveBtnEditHistory = document.querySelector('.save-btn-history-edit');

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

// Function for the Save Button
// saveBtnFixed.onclick = async () => {
//   console.log("Not a number");

//   const currentMonth = String(currentMonthIndex + 1).padStart(2, '0'); // Ensure month is in MM format
//   const income = incomeFixed.value || 0;
//   const expenses = expenseFixed.value || 0;
//   const savings = savingsFixed.value || 0;



//   // Call saveMonthlyBudget with the current month, year, and the new values
//   await saveMonthlyBudget(currentMonth, currentYear, income, expenses, savings)
//     .then(response => {
//       console.log(response.message); // Log success message
//       // Optionally, update the UI to reflect changes or notify the user of success
//     })
//     .catch(error => {
//       console.error("Failed to update monthly budget:", error);
//       // Handle error (e.g., show error message to the user)
//     });
// };


categoryBtn.onclick = async () => {
  let month = currentMonthIndex + 1; // JavaScript months are 0-indexed, add 1 for consistency with common representations
  let year = currentYear;
  const monthlyBudget = await fetchMonthlyBudget(month, year);
  incomeFixed.value = monthlyBudget.income || 0;
  expenseFixed.value = monthlyBudget.expenses || 0;
  savingsFixed.value = monthlyBudget.savings || 0;

  if (incomeFixed.value == '0' && expenseFixed.value == '0' && savingsFixed.value == '0') {
    alert("Please set up fixed income and expenses first in the primary budget overview");
    return;
  }
  else {
    console.log("Activated");
    addCategoryDialog.showModal();
    console.log("Category Name: " + categoryName.value);
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
    await spawnCategory(categoryName.value, categoryColor.value);  // Create category
    await updateCategory();
    await updateUserValuesView();
    categoryName.value = "";
    categoryGoal.value = "";
  }
};

editCategoryBtn.onclick = async () => {
  await dropDownFetchCategoriesExpense(dropdownEdit);
  let month = currentMonthIndex + 1;
  let year = currentYear;
  let data = await fetchDatabase(); // Fetch data from the database
  //let categories = Object.keys(data.customExpenses);
  const monthlyBudget = await fetchMonthlyBudget(month, year);
  incomeFixed.value = monthlyBudget.income || 0;
  expenseFixed.value = monthlyBudget.expenses || 0;
  savingsFixed.value = monthlyBudget.savings || 0;


  if (incomeFixed.value == '0' && expenseFixed.value == '0' && savingsFixed.value == '0') {
    alert("Please set up fixed income and expenses first in the primary budget overview");
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
  } else {
    console.log("did nothing")

  }
};

closeBtnEditCategory.onclick = () => {
  categoryName.value = "";
  categoryGoal.value = "";
  editCategoryDialog.close();
};

saveBtnEditCategory.onclick = async () => {

  editCategoryDialog.close();

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
// Function for updating values of categories in html and database
async function updateCategory() {
  const paragraphs = categories.querySelectorAll("p");
  const pies = categories.querySelectorAll(".pie");
  const categoryData = await fetchAndProcessCategoryData();


  let i = 0;
  Object.entries(categoryData).forEach(([category, items]) => {
    setPiePercentage((items.totalExpense / items.goal * 100), pies[i]);
    paragraphs[i].textContent = items.totalExpense + "/" + items.goal;
    i++;
  });
}

async function fetchAndProcessCategoryData() {
  // Use currentMonthIndex and currentYear from the global scope
  const month = String(currentMonthIndex + 1).padStart(2, '0');
  const year = currentYear.toString();

  const expenses = await fetchCustomExpensesByMonthAndYear(username, month, year);
  const categoriesData = {};

  for (const category in expenses) {
    let totalExpense = 0;
    let goal = 0; // Default goal to 0 if not found
    expenses[category].forEach(item => {
      if (item.name === "##GOAL##") {
        goal = parseFloat(item.value);
      } else {
        totalExpense += parseFloat(item.amount);
      }
    });
    categoriesData[category] = { totalExpense, goal };
  }

  return categoriesData;
}

async function inputCategoryToBackend() {
  let name = "##GOAL##";
  let items = [{ "name": name, "value": categoryGoal.value, "color": categoryColor.value }];
  console.log(categoryColor.value);

  goalData = {
    username,
    customExpense: items,
    category: categoryName.value,
  }
  await updateCustomExpense(goalData); //Sends the goal data to backend
}

async function editCategoryToBackend() {
  let name = "##GOAL##";
  let items = [{ "name": name, "value": editCategoryGoal.value }];

  goalData = {
    username,
    customExpense: items,
    category: dropdownEdit.value,
    newName: editCategoryName.value,
  }
  console.log(goalData);
  await updateCustomExpense(goalData); //Sends the goal data to backend  
}


// Function for creating a new catogory in the html and the database
async function spawnCategory(categoryTitle, color) {
  try {
    // Find the container for categories
    const categoriesContainer = document.querySelector('.categories');

    //Removes the "add category"
    const button = categoriesContainer.querySelector('button');
    button.remove();

    // Create elements for the category
    const categoryDiv = document.createElement('div');
    categoryDiv.classList.add('pie-line');  // Set class to "pie-line" to create grey circle
    categoryDiv.style.setProperty('--b', '10px');
    categoryDiv.style.marginBottom = '7%';

    // Create span element
    const span = document.createElement('span');
    span.classList.add('category-text'); // Set class to "category-text" to position title above circle
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
    paragraph.textContent = 0;   // Set the goal for the category

    // Append the paragraph to the pie div
    pie.appendChild(paragraph)

    // Append the span and pie div to the category div
    categoryDiv.appendChild(span);
    categoryDiv.appendChild(pie);

    // Append the category div to the categories container
    categoriesContainer.appendChild(categoryDiv);

    // Lastly, add back the new category button
    const newButton = document.createElement('button');
    newButton.classList.add('add-circle');
    newButton.style.marginBottom = '7%';
    newButton.textContent = '+';
    categoriesContainer.appendChild(newButton);

    newButton.addEventListener('click', () => {
      console.log("activated")
      addCategoryDialog.showModal();
      console.log("category Name:" + categoryName.value)
    });

    return newButton;

    // Optionally, you can return the category element if you need to manipulate it further
    // return categoryDiv;
  } catch (error) {
    console.log("Error: " + error);
    throw error;
  }
}

//#####################
// FUNCTIONS FOR DROPDOWN MENUS
//##################### 
//// These functions fetch categories from the database, and places them into a dropdown menu

async function dropDownFetchCategoriesExpense(dropdown) {
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

/*async function dropDownFetchCategoriesIncome() {
  try {
    dropdownIncome.innerHTML = ''; // Clear existing options
    let data = await fetchDatabase();
    let categories = Object.keys(data.customIncomes);
    categories.forEach(category => {
      let option = document.createElement("option");
      option.textContent = category;
      dropdownIncome.appendChild(option);
    });
  } catch (error) {
    console.error('An error occurred fetching categories from database:', error);
  }
}*/

//#####################
// Utility Functions
//##################### 
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

function setPiePercentage(percent, piechart) {
  piechart.style.setProperty('--p', percent);
  piechart.classList.remove("animate");
  void piechart.offsetWidth;
  piechart.classList.add("animate");
}

function setPieColor(piechart, color) {
  piechart.style.setProperty("--c", color);
}

function getFormattedDate() {
  let now = new Date();
  const year = now.getFullYear();
  const month = currentMonthIndex + 1;
  const day = now.getDate();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const formattedDate = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  return formattedDate;
}


//#####################
// Data Handling
//##################### 
async function fetchDatabase() {
  return fetchData(API_ENDPOINTS.fetchBudget, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

async function fetchCategories() {
  try {
    const data = await fetchDatabase();
    const categories = data.customExpenses ? Object.keys(data.customExpenses) : [];

    categories.forEach(category => {
      spawnCategory(category, data.customExpenses[category][0].color); // getCategoryColor(category)
    });
    updateCategory();
  } catch (error) {
    console.log('Error fetching categories: ', error);
    throw error;
  }
}


async function updateCustomExpense(dataExpense) {
  return fetchData(API_ENDPOINTS.addCustomExpense, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataExpense),
  });
}

async function updateCustomIncome(dataIncome) {
  return fetchData(API_ENDPOINTS.addCustomIncome, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataIncome),
  });
}

// This function needs username, category, items, & income or expense for deletion
// like this:
// await deleteCategory({category:category, })
async function deleteCustomData(data) {
  return fetchData(API_ENDPOINTS.deleteData, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

// This function needs username & category for deletion
// like this:
// await deleteCategory({username:username, category:category})
async function deleteCategory(data) {
  return fetchData(API_ENDPOINTS.deleteCategory, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

// Function to check if a given category is already taken --- 1 = category exist, 0 == category does not exits
async function categoryAvailableCheck(categoryInput) {
  try {
    let data = await fetchDatabase();                  //Fetches data from database
    let categories = Object.keys(data.customExpenses); //Accesses all category names in that budget
    for (let i = 0; i < categories.length; i++) {
      if (categories[i] === categoryInput) {
        return 1;
      }
    } return 0;
  } catch (error) {
    console.error('An error occurred fetching categories from database:', error);
  }
}

//Function to get all costume income and add them together
async function fetchAndProcessIncomeData() {
  // Use currentMonthIndex and currentYear from the global scope
  const month = String(currentMonthIndex + 1).padStart(2, '0');
  const year = currentYear.toString();

  const incomes = await fetchCustomIncomesByMonthAndYear(username, month, year);
  const categoriesData = {};

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
    categoriesData[category] = { totalIncome, goal };
  }

  return categoriesData;
}

async function fetchHistory() {
  try {
    const data = await fetchDatabase();
    const categoriesExpenses = data.customExpenses ? Object.keys(data.customExpenses) : []; // Add names of all categories to array
    let arrayOfHistories = [];

    // Get name, price, category and timestamp for each expense in database
    categoriesExpenses.forEach(category => {
      data.customExpenses[category].forEach(expense => {    // Iterate over the expenses array directly
        if (expense.name == '##GOAL##') {   // Exclude first entry in database containing the category goal
          return;
        }

        expense.category = category;
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

    arrayOfHistories.sort((a, b) => new Date(b.date) - new Date(a.date));  // Sort array after timestamp

    arrayOfHistories.forEach(history => {   // Create table for each income and expense entry in database
      createTable(history, history.category, 0); // TODO: Add parameter for editBtn
    });

  } catch (error) {
    console.log('Error trying to fetch history: ', error);
  }
}

async function fetchCustomExpensesByMonthAndYear(username, month, year) {
  const url = API_ENDPOINTS.fetchCustomExpensesByMonthAndYear
    .replace(':username', username)
    .replace(':month', month)
    .replace(':year', year);

  return fetchData(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

async function fetchCustomIncomesByMonthAndYear(username, month, year) {
  const url = API_ENDPOINTS.fetchCustomIncomesByMonthAndYear
    .replace(':username', username)
    .replace(':month', month)
    .replace(':year', year);

  return fetchData(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}



//#####################
// UI Updates
//##################### 
async function updateUserValuesView() {
  try {
    const currentMonth = String(currentMonthIndex + 1).padStart(2, '0');
    // Use currentYear directly without redeclaring it
    const yearString = currentYear.toString();
    const monthlyBudget = await fetchMonthlyBudget(currentMonth, yearString);

    const customExpenseData = await fetchAndProcessCategoryData();
    const customIncomeData = await fetchAndProcessIncomeData();

    let totalCustomExpense = 0;
    let totalCustomIncome = 0;

    Object.entries(customExpenseData).forEach(([category, items]) => {
      totalCustomExpense += items.totalExpense;
    });

    Object.entries(customIncomeData).forEach(([category, items]) => {
      totalCustomIncome += items.totalIncome;
    });

    let netExpenses = (monthlyBudget.expenses + totalCustomExpense - totalCustomIncome);

    totalAmount.textContent = "Fixed Income: " + monthlyBudget.income;
    spentAmount.textContent = "Net expenses: " + netExpenses;
    leftAmount.textContent = "Available: " + (monthlyBudget.income - netExpenses - monthlyBudget.savings);
    savingsAmount.textContent = "Savings: " + monthlyBudget.savings;
    setPiePercentage(((netExpenses + monthlyBudget.savings) / (monthlyBudget.income) * 100), pie);

  } catch (error) {
    console.error("Error: ", error);
  }
}

async function updateHistory(category) {
  try {
    const data = await fetchDatabase();
    const categoriesExpenses = data.customExpenses ? Object.keys(data.customExpenses) : []; // Add names of all categories to array
    const categoriesIncomes = data.customIncomes ? Object.keys(data.customIncomes) : []; // Add names of all categories to array

    // Update expenses
    if (categoriesExpenses.includes(category)) {        // Checks if the category exsists
      const expenses = data.customExpenses[category];   // Put array of expenses in category into variable
      if (expenses.length > 0) {
        const lastExpense = expenses[expenses.length - 1];

        console.log(category);
        console.log(lastExpense);
        createTable(lastExpense, category, 1);
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
        const lastIncome = incomes[incomes.length - 1];

        console.log(category);
        console.log(lastIncome);
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

// Function for deleting history table and then creating it again with the new entries
async function refreshHistory() {
  const allTableElements = table.querySelectorAll('p, tr, td, button, dialog, h3, input, div'); // Q-Select all elements currently in the table
  console.log('Table: ', allTableElements);
  allTableElements.forEach(element => {
    element.remove();
  });

  await updateCategory();
  await updateUserValuesView();
  await fetchHistory();
}

async function refreshCategories() {
  const allCategoryElements = categories.querySelectorAll('div, span, p'); // Q-Select all elements currently in the table
  console.log('Category: ', allCategoryElements);
  allCategoryElements.forEach(element => {
    element.remove();
  });
  await fetchCategories();
  await refreshHistory();
}

//#####################
// HISTORY TABLE
//#####################
function createTable(data, category, newOrOld = 0) {  // data formated as {name, amount, date, _id, category}
  console.log(data);
  let simpleDate = new Date(data.date).toDateString().slice(4);    // Slice to remove the name of the day

  //#######################
  // CREATE TABLE ELEMENTS
  //#######################
  // Builds row 1 for the history window 
  const row1 = document.createElement('tr');

  const expenseName = document.createElement('td');
  const expensePrice = document.createElement('td');

  expenseName.textContent = data.name;

  //Changes the look in the history, so expences has a '-' infront
  if (!(category === 'Income')) {
    expensePrice.textContent = '-' + data.amount + ' DKK';
    expensePrice.style.color = '#CC3333'; // Add this line to set the text color to red
  } else {
    expensePrice.textContent = data.amount + ' DKK';
  }

  row1.appendChild(expenseName);
  row1.appendChild(expensePrice);

  // Builds row 2 for the history window 
  const row2 = document.createElement('tr');

  const expenceCategory = document.createElement('td');
  const historyExpenseEdit = document.createElement('td');
  const editBtn = document.createElement('button');
  const deleteBtn = document.createElement('button');

  expenceCategory.textContent = category + ' - ' + simpleDate;
  editBtn.textContent = 'Edit';
  deleteBtn.textContent = 'Delete';

  editBtn.classList.add('editHistory');
  deleteBtn.classList.add('editHistory');
  historyExpenseEdit.classList.add('historyBtns');
  historyExpenseEdit.appendChild(editBtn);
  historyExpenseEdit.appendChild(deleteBtn);

  row2.appendChild(expenceCategory);
  row2.appendChild(historyExpenseEdit);
  if (newOrOld) {   // If true == new
    table.prepend(row2);      // adds the second row to the table
    table.prepend(row1);      // set the row in the table
  } else {
    table.appendChild(row1);      // set the row in the table
    table.appendChild(row2);      // adds the second row to the table
  }

  //############################
  // CREATE DIALOGS AND BUTTONS
  //############################
  // Create dialog element
  const editHistoryDialog = document.createElement('dialog');
  editHistoryDialog.classList.add('edit-history');

  // Create h3 element for heading
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
  // Adds funcunality to the "edit" button
  editBtn.addEventListener('click', async () => {
    editHistoryDialog.showModal();
  });

  closeButton.onclick = async () => {
    editHistoryDialog.close();
  };

  saveButton.onclick = async () => {
    if (isNaN(valueInput.value)) {
      alert("Please enter valid numbers for value.");
      return; // Exit function if any input is not a number
    }
    if (valueInput.value < 0) {
      valueInput.value *= (-1);
    }

    //If user should enter a negative number, it will be converted
    if (valueInput.value < 0) {
      valueInput.value = valueInput.value * (-1);
    }


    let dataPackage = {
      username: username,
      category: category,
      customData: [data],
    }
    await deleteCustomData(dataPackage);

    editHistoryDialog.close();  // Close dialog

    if (!(category === "Income")) {
      let newExpenseData = {
        username: username,
        category: category,
        customExpense: [data],
      };

      let newName = nameInput.value
      let newValue = valueInput.value

      if (newName) {
        newExpenseData.customExpense[0].name = newName;
      }
      if (newValue) {
        newExpenseData.customExpense[0].amount = newValue;
      }

      await updateCustomExpense(newExpenseData)
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

      await updateCustomIncome(newIncomeData)
    }

    await refreshHistory();
  };

  // Adds funcunality to the "delete" button
  deleteBtn.addEventListener('click', async () => {
    const confirmation = window.confirm(`Are you sure you want to delete the entry "${data.name}"?`);

    if(confirmation) {
      let dataPackage = {
        username: username,
        category: category,
        customData: [data],
      }

      await deleteCustomData(dataPackage);
      await refreshHistory();
    } else {
      console.log("User cancelled deletion");
    }
  });
}

//#####################
// EVENT HANDLERS
//##################### 
async function setupEventListeners() {


  document.querySelector('.show-popup-fixed').onclick = () => {
    document.querySelector('.popup-container-fixed').classList.add("active");
  };

  document.querySelector('.close-btn-fixed').onclick = () => {
    document.querySelector('.popup-container-fixed').classList.remove("active");
  };

  document.querySelector('.save-btn-fixed').onclick = async () => {
    const incomeFixed = document.querySelector(".income-fixed");
    const expenseFixed = document.querySelector(".expense-fixed");
    const savingsFixed = document.querySelector(".savings-fixed");


    if (incomeFixed.value == '' || expenseFixed.value == '' || savingsFixed.value == '') {
      alert("Please enter numbers in all number-fields");
      return; // Exit function if any input is not a number
    }

    if (isNaN(incomeFixed.value) || isNaN(expenseFixed.value) || isNaN(savingsFixed.value)) {
      alert("Please enter valid numbers for income, expenses, and savings.");
      return; // Exit function if any input is not a number
    }

    //checks if user enters a negative number and converts it to positivt, not for savings, as some might want to use their savings
    if ((incomeFixed.value) < 0) {
      incomeFixed.value *= (-1);
    }
    if ((expenseFixed.value) < 0) {
      expenseFixed.value *= (-1);
    }


    let incomeVal = incomeFixed.value;
    let expenseVal = expenseFixed.value;
    let savingsVal = savingsFixed.value;

    // Assuming currentMonthIndex and currentYear are already defined and hold the correct values
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

    // Assuming saveMonthlyBudget is a function that correctly handles the API request to your backend
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

    document.querySelector('.popup-container-fixed').classList.remove("active");
    incomeFixed.value = localStorage.getItem('incomeFixed') || '';
    expenseFixed.value = localStorage.getItem('expenseFixed') || '';
    savingsFixed.value = localStorage.getItem('savingsFixed') || '';
  };

  document.querySelector('.show-popup-income').onclick = async () => {
    let month = currentMonthIndex + 1; // JavaScript months are 0-indexed, add 1 for consistency with common representations
    let year = currentYear;
    const monthlyBudget = await fetchMonthlyBudget(month, year);
    incomeFixed.value = monthlyBudget.income || 0;
    expenseFixed.value = monthlyBudget.expenses || 0;
    savingsFixed.value = monthlyBudget.savings || 0;

    if (incomeFixed.value == '0' && expenseFixed.value == '0' && savingsFixed.value == '0') {
      alert("Please set up fixed income and expenses first in the primary budget overview");
      return;
    }
    else {
      document.querySelector('.popup-container-income').classList.add("active");
    }
  };
  document.querySelector('.close-btn-income').onclick = () => {
    document.querySelector('.popup-container-income').classList.remove("active");
  };
  document.querySelector('.save-btn-income').onclick = async () => {
    const valueCustomIncome = document.querySelector(".value-income");
    if (isNaN(valueCustomIncome.value)) {
      alert("Please enter valid number for the income.");
      return; // Exit function if any input is not a number
    }
    let name = nameCustomIncome.value;

    //check if user has used a minus when typing the number, converts it to positive.
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
    document.querySelector('.popup-container-income').classList.remove("active");
    await updateCustomIncome(dataIncome);
    await updateUserValuesView();
    await updateHistory('Income');

    valueCustomIncome.value = "";
  };

  document.querySelector('.show-popup-expense').onclick = async () => {
    await dropDownFetchCategoriesExpense(dropdownEdit);
    let data = await fetchDatabase(); // Fetch data from the database
    let month = currentMonthIndex + 1; // JavaScript months are 0-indexed, add 1 for consistency with common representations
    let year = currentYear;
    const monthlyBudget = await fetchMonthlyBudget(month, year);
    incomeFixed.value = monthlyBudget.income || 0;
    expenseFixed.value = monthlyBudget.expenses || 0;
    savingsFixed.value = monthlyBudget.savings || 0;

    if (incomeFixed.value == '0' && expenseFixed.value == '0' && savingsFixed.value == '0') {
      alert("Please set up fixed income and expenses first in the primary budget overview");
      return;
    }
    if (!data.customExpenses || Object.keys(data.customExpenses).length === 0) {
      alert("No category found. Please create category first.");
      return;
    } else {
      document.querySelector('.popup-container-expense').classList.add("active");
      await dropDownFetchCategoriesExpense(dropdownExpense);
    };
  }
  document.querySelector('.close-btn-expense').onclick = () => {
    document.querySelector('.popup-container-expense').classList.remove("active");
  };

  document.querySelector('.save-btn-expense').onclick = async () => {
    const nameCustomExpense = document.querySelector(".name-expense");
    const valueCustomExpense = document.querySelector(".value-expense");
    const dropdownExpense = document.querySelector(".dropdown-expense");
    let category = dropdownExpense.value;

    //checks if user try to enter letters into expense number field
    if (isNaN(valueCustomExpense.value)) {
      alert("Please enter valid number for expenses.");
      return; // Exit function if any input is not a number
    }

    let value = valueCustomExpense.value;

    //if user enters negative number, it will be converted to positive
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
    document.querySelector('.popup-container-expense').classList.remove("active");
    await updateCustomExpense(dataExpense);
    await updateCategory();
    await updateUserValuesView();
    await updateHistory(category);

    nameCustomExpense.value = "";
    valueCustomExpense.value = "";
  };

  // Add more event listeners here
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      if (document.querySelector('.popup-container-fixed').classList.contains('active')) {
        document.querySelector('.save-btn-fixed').click();
      } else if (document.querySelector('.popup-container-income').classList.contains('active')) {
        document.querySelector('.save-btn-income').click();
      } else if (document.querySelector('.popup-container-expense').classList.contains('active')) {
        document.querySelector('.save-btn-expense').click();
      }
      else if (document.querySelector('.add-category-dialog').classList.contains('active')) {
        document.querySelector('.save-btn-category').click();
      }
      else if (document.querySelector('.edit-category-dialog').classList.contains('active')) {
        document.querySelector('.save-btn-category-edit').click();
      }
    }
  });
}


// TEST TIL DELETE CUSTOM (BEHOLD)

let items1 = [{
  name: "idtest",
  amount: 700,
  date: "2024-4-22 10",
  _id: "1713808910591"
}]
let items2 = [{
  name: "test6",
  amount: 700,
  date: "2024-4-22 10",
  _id: "1714380055527"
}]

let dataForDeletionIncome = {
  username,
  customData: items1,
  category: "income",
  incomeOrExpense: "income",
}
let dataForDeletionExpense = {
  username,
  customData: items2,
  category: "mad",
  incomeOrExpense: "expense",
}

//deleteCustomData(dataForDeletionIncome);
//deleteCustomData(dataForDeletionExpense);

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
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let currentMonthName = monthNames[currentMonthIndex];

  const prevMonthButton = document.querySelector('#prevMonth');
  const currentMonthSpan = document.querySelector('#currentMonth');
  const nextMonthButton = document.querySelector('#nextMonth');

  async function updateMonthDisplay() {
    currentMonthName = monthNames[currentMonthIndex];
    currentMonthSpan.textContent = currentMonthName + ' ' + currentYear;
  }

  await updateMonthDisplay();

  prevMonthButton.addEventListener('click', async () => {
    if (currentMonthIndex === 0) {
      currentMonthIndex = 11;
      currentYear -= 1;
    } else {
      currentMonthIndex -= 1;
    }
    await updateMonthDisplay();
    // await fetchAndProcessCategoryData();
    await updateUserValuesView();
    await updateCategory();
  });

  nextMonthButton.addEventListener('click', async () => {
    if (currentMonthIndex === 11) {
      currentMonthIndex = 0;
      currentYear += 1;
    } else {
      currentMonthIndex += 1;
    }
    await updateMonthDisplay();
    // await fetchAndProcessCategoryData();
    await updateUserValuesView();
    await updateCategory();
  });
});
async function fetchMonthlyBudget(month, year) {
  const url = API_ENDPOINTS.fetchMonthlyBudget.replace(':month', month).replace(':year', year);
  return fetchData(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

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




function glowButton(buttons) {
  let current = 0; // Start with the first button
  let colorPicked = false;
  const progressBar = document.querySelector('.progress-bar-fill');
  const progressContainer = document.querySelector('.progress-bar');
  const progressLabel = document.querySelector('.progress-label'); // Get the progress label
  const updateProgressBar = () => {
    const progressPercentage = Math.round((current / (buttons.length - 3)) * 100);
    progressBar.style.width = `${progressPercentage}%`;
    progressBar.textContent = progressPercentage + '%'; // Display percentage
    if(progressPercentage === 100) {
      progressBar.textContent = 'Tutorial Completed'; // Change text when tutorial is complete
      progressContainer.style.display = 'none'; // Hide progress bar when tutorial is complete
      progressLabel.style.display = 'none'; // Hide progress label when tutorial is complete
    }
  };
  // Initially disable all non-input buttons
  buttons.forEach(button => {
    if (button.tagName !== 'INPUT') {
      button.disabled = true;
    }
  });

  const nextButton = () => {
    // Disable the previous button and enable the current one
    updateProgressBar();
    if (current > 0) {
      if (buttons[current - 1].tagName !== 'INPUT') {
        buttons[current - 1].disabled = true; // Disable the previous button if it's not an input
      }
      buttons[current - 1].classList.remove('glow-effect'); // Remove glow from previous button
    }

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
      window.location.reload(); // Reload the page
    }
  };

  const handleInput = () => {
    if (buttons[current].value.trim() !== '' && !isNaN(buttons[current].value)) {
      current++;
      nextButton();
    }
  };

  const handleFreeTextInput = () => {
    if (buttons[current].value.trim() !== '') {
      current++;
      nextButton();
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

document.addEventListener('DOMContentLoaded', () => {
  // Check URL for the startTutorial query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const startTutorial = urlParams.get('startTutorial');
  const skipButton = document.querySelector('.skip-tutorial-btn'); // Get the skip button
  const progressContainer = document.querySelector('.progress-bar'); // Get the progress bar container
  const progressLabel = document.querySelector('.progress-label'); // Get the progress label
  if (startTutorial === 'true') {
    localStorage.setItem('startTutorial', 'true');
    history.replaceState(null, '', location.pathname);
  }

  if (localStorage.getItem('startTutorial') === 'true') {
    alert(`Welcome to Studie Budget \n
    Follow the glow to complete the tutorial or press the skip tutorial button to skip the tutorial.`);
    skipButton.style.display = 'block'; // Show skip button only if tutorial is active
    progressContainer.style.display = 'block'; // Show progress bar only if tutorial is active
    progressLabel.style.display = 'block'; // Show progress label only if tutorial is active

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
    skipButton.addEventListener('click', () => {
      localStorage.removeItem('startTutorial'); // Remove the tutorial flag
      skipButton.style.display = 'none'; // Hide skip button
      progressContainer.style.display = 'none'; // Hide progress bar
      progressLabel.style.display = 'none'; // Hide progress label
      window.location.reload(); // Reload the page
    });
  } else {
    skipButton.style.display = 'none'; // Hide skip button if not in tutorial
    progressContainer.style.display = 'none'; // Hide progress bar if not in tutorial
    progressLabel.style.display = 'none'; // Hide progress label if not in tutorial
  }
});
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



window.onload = function () {
  var videoContainer = document.querySelector('.video-container');
  var iframe = document.createElement('iframe');
  iframe.setAttribute('width', '1078');
  iframe.setAttribute('height', '541');
  iframe.setAttribute('src', 'https://www.youtube.com/embed/C61cY9cCnt4');
  iframe.setAttribute('title', 'student budget');
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
  iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  iframe.setAttribute('allowfullscreen', '');
  videoContainer.innerHTML = ''; // Clear the existing content
  videoContainer.appendChild(iframe);
}

