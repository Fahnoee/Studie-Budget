//#####################
// Constants and Configuration
//#####################
const body = document.querySelector('body');
const pie = document.querySelector('.pie');
const totalAmount = document.querySelector('.total');
const spentAmount = document.querySelector('.spent');
const leftAmount = document.querySelector('.left');
const API_ENDPOINTS = {
  fetchBudget: "/api/budget/:budgetID",
  updateBudget: "/api/update_budget",
  addCustomExpense: "/api/addcustom/expense",
  addCustomIncome: "/api/addcustom/income",
};

//#############
// Q-SELECTORS
//#############

// FIXED
const showPopupFixed = document.querySelector('.show-popup-fixed');
const popupContainerFixed = document.querySelector('.popup-container-fixed');
const closeBtnFixed = document.querySelector('.close-btn-fixed');
const saveBtnFixed = document.querySelector('.save-btn-fixed');
const incomeFixed = document.querySelector('.income-fixed');
const expenseFixed = document.querySelector('.expense-fixed');

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
const dropdownIncome = document.querySelector('.dropdown-income');
const nameCustomIncome = document.querySelector('.name-income');
const valueCustomIncome = document.querySelector('.value-income');

// CATEGORIES
const categoryBtn = document.querySelector('.add-circle');
const categoryDialog = document.querySelector('.dialog');
const categoryName = document.querySelector('.category-name');
const categoryGoal = document.querySelector('.category-goal');
const categoryColor = document.querySelector('.category-color');
const closeBtnCategory = document.querySelector('.close-btn-category');
const saveBtnCategory = document.querySelector('.save-btn-category');

// HISTORY
const table = document.querySelector('.styled-table');

//#####################
// FUNCTIONS FOR POPUP
//#####################
////////FIXED INCOMES/ EXPENSES
// Function for popup buttons
showPopupFixed.onclick = () => {
  popupContainerFixed.classList.add("active");     // Activates popup by adding class to div
};
// Function for the Close Button
closeBtnFixed.onclick = () => {
  popupContainerFixed.classList.remove("active");    // Deactivates popup by removing class from div
};

// Function for the Save Button
saveBtnFixed.onclick = async () => {
  let incomeVal = incomeFixed.value;
  let expenseVal = expenseFixed.value;
  let data = {
    username,
    income: incomeVal,
    expenses: expenseVal,
    goal: 320,
  };

  popupContainerFixed.classList.remove("active");    // Deactivates popup by removing class from div

  await updateBudget(data);                     // Firstly update the budget  in the database with new values
  await updateUserValuesView();                 // Here we update the userValues showed within the piechart with values from database

  // Save changed income/expense to pie chart
  let getPieStyle = getComputedStyle(pie);
  let getPieValue = getPieStyle.getPropertyValue('--p');
  console.log("The value of --p is: " + getPieValue);
  incomeFixed.value = "";
  expenseFixed.value = "";
};


categoryBtn.onclick = () => {
  console.log("Activated");
  categoryDialog.showModal();
  console.log("Category Name: " + categoryName.value);
};

closeBtnCategory.onclick = () => {
  categoryName.value = "";
  categoryGoal.value = "";
  categoryDialog.close();
}

saveBtnCategory.onclick = async () => {
  categoryDialog.close();
  await inputCategoryToBackend();
  await spawnCategory(categoryName.value, categoryColor.value);  // Create category
  await updateCategory();
  await updateUserValuesView();
  categoryName.value = "";
  categoryGoal.value = "";
};

//#####################
// FUNCTIONS FOR CATEGORIES
//##################### 
// Function for updating values of categories in html and database
async function updateCategory() {
  const categories = document.querySelector(".categories");
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
  const data = await fetchDatabase();
  const categoriesData = {};

  if (data && data.customExpenses) {
    for (const category in data.customExpenses) {
      let totalExpense = 0;
      let goal = null;
      data.customExpenses[category].forEach(item => {
        if (item.name === "##GOAL##") {
          goal = parseFloat(item.value);
        } else {
          totalExpense += parseFloat(item.amount);
        }
      });
      categoriesData[category] = { totalExpense, goal };
    }
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
    categoryDiv.style.marginBottom = '7%';

    // Create span element
    const span = document.createElement('span');
    span.classList.add('category-text'); // Set class to "category-text" to position title above circle
    span.textContent = categoryTitle; // Set title to user input

    // Create a div element for the pie chart 
    const pie = document.createElement('div');
    pie.classList.add('pie', 'animate'); // Add classes for styling 
    pie.style.setProperty('--w', '100px');  // Set size of circle
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
      categoryDialog.showModal();
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

async function dropDownFetchCategoriesExpense() {
  try {
    dropdownExpense.innerHTML = ''; // Clear existing options
    let data = await fetchDatabase();                  //Fetches data from database
    let categories = Object.keys(data.customExpenses); //Accesses all category names in that budget
    categories.forEach(category => {                   //Puts them into an array and displays them in the dropdown menu on the "add custom" popup
      let option = document.createElement("option");
      option.textContent = category;
      dropdownExpense.appendChild(option);

    });
  } catch (error) {
    console.error('An error occurred fetching categories from database:', error);
  }
}

async function dropDownFetchCategoriesIncome() {
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
}

//#####################
// Utility Functions
//##################### 
async function fetchData(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error("Network response was not ok");
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

function getDate() {
  let now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
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

async function updateBudget(data) {
  return fetchData(API_ENDPOINTS.updateBudget, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

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

//Function to get all costume income and add them together
async function fetchAndProcessIncomeData() {
  try {
    const data = await fetchDatabase(); // Assuming this function fetches the full budget data
    const categoriesData = {};

    if (data && data.customIncomes) {
      for (const category in data.customIncomes) {
        let totalIncome = 0;
        data.customIncomes[category].forEach(item => {
          totalIncome += parseFloat(item.amount);
        });
        categoriesData[category] = { totalIncome };
      }
    }
    return categoriesData;
  } catch (error) {
    console.error('Error processing category data:', error);
  }
}

async function fetchHistory() { 
  try {
    const data = await fetchDatabase();
    const categoriesExpenses = data.customExpenses ? Object.keys(data.customExpenses) : []; // Add names of all categories to array
    let arrayOfHistories = [];

    // Get name, price, category and timestamp for each expense in database
    categoriesExpenses.forEach(category => {
      data.customExpenses[category].forEach(expense => {    // Iterate over the expenses array directly
        if (expense.name == '##GOAL##'){   // Exclude first entry in database containing the category goal
          return;
        }
        let name = expense.name;
        let price = expense.amount;
        let timestamp = expense.date;

        let history = {name: name, price: price, category: category, timestamp: timestamp}; // Insert into object
        arrayOfHistories.push(history);   // Add object to array
        
      });
    });

    // Get name, price, category and timestamp for each income in database
    const categoriesIncomes = data.customIncomes ? Object.keys(data.customIncomes) : [];
    categoriesIncomes.forEach(category => {
      data.customIncomes[category].forEach(income => {  // Iterate over the incomes array directly
        if (income.name == '##GOAL##'){   // Exclude first entry in database containing the category goal
          return;
        }
        let name = income.name;
        let price = income.amount;
        let timestamp = income.date;
        
        let history = {name: name, price: price, category: category, timestamp: timestamp}; // Insert into object
        arrayOfHistories.push(history);   // Add object to array
      });
    });

    arrayOfHistories.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));  // Sort array after timestamp
    
    console.log(arrayOfHistories);
    
    arrayOfHistories.forEach(history => {   // Create table for each income and expense entry in database
      let simpleDate = new Date(history.timestamp).toDateString().slice(4);    //slice to remove the name of the day
      creatTable(history.name, history.price, history.category, simpleDate); // TODO: Add parameter for editBtn
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

// Example usage
async function logCustomExpensesForCurrentMonth() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  console.log('Passing month:', month, 'and year:', year, 'to fetchCustomExpensesByMonthAndYear');

  try {
    const expenses = await fetchCustomExpensesByMonthAndYear(username, month, year);
    console.log('Custom expenses for the current month:', expenses);
  } catch (error) {
    console.error('Error fetching custom expenses:', error);
  }
}
// Call the function to log the expenses
logCustomExpensesForCurrentMonth();        //test function der skal slettes senere

// CHECK IF CATEGORY ALREADY EXISTS

async function checkCategoryAvailability(categoryInput) {
  try {
    let data = await fetchDatabase();                  //Fetches data from database
    let categories = Object.keys(data.customExpenses); //Accesses all category names in that budget
    categories.forEach(category => {                   //Puts them into an array and displays them in the dropdown menu on the "add custom" popup
      if(category === categoryInput){
        return 1;
      }else return 0;
    });
  } catch (error) {
    console.error('An error occurred fetching categories from database:', error);
  }
}


//#####################
// UI Updates
//##################### 
async function updateUserValuesView() {
  try {
    const data = await fetchDatabase();       // Call fetchDatabase and get userbudget-data returned.
    const customExpenseData = await fetchAndProcessCategoryData();
    const customIncomeData = await fetchAndProcessIncomeData();
    // Update UI with fetched data
    let totalCustomExpense = 0;
    let totalCustomIncome = 0;

    Object.entries(customExpenseData).forEach(([category, items]) => { //Add all custom expenses together
      totalCustomExpense += items.totalExpense;
      console.log("Expense cirkeltest: " + totalCustomExpense);
    });

    Object.entries(customIncomeData).forEach(([category, items]) => { //Add all custom expenses together
      totalCustomIncome += items.totalIncome;
      console.log("Expense cirkeltest: " + totalCustomIncome);
    });

    let netExpenses = (data.expenses + totalCustomExpense - totalCustomIncome);

    totalAmount.textContent = "Fixed Income: " + data.income;      // Place data into variables
    spentAmount.textContent = "Net expenses: " + netExpenses;
    leftAmount.textContent = "Available: " + (data.income - netExpenses);
    setPiePercentage(((netExpenses) / (data.income) * 100), pie);    // Calculates the percentage that need to be painted
  } catch (error) {
    console.error("Error: ", error);
  }
}

async function updateHistory(category) {
  const data = await fetchDatabase();
  const categoriesExpenses = data.customExpenses ? Object.keys(data.customExpenses) : []; // Add names of all categories to array

  
}

//#####################
// HISTORY TABLE
//#####################
function creatTable(name, price, category, timestamp){
  // Builds row 1 for the history window 
  const row1 = document.createElement('tr');
  
  const expenseName = document.createElement('td');
  const expensePrice = document.createElement('td');

  expenseName.textContent = name;
  expensePrice.textContent = price + ' DKK';

  row1.appendChild(expenseName);
  row1.appendChild(expensePrice);

  table.appendChild(row1);      // set the row in the table
  
  // Builds row 2 for the history window 
  const row2 = document.createElement('tr');

  const expenceCategory = document.createElement('td');
  const historyExpenseEdit = document.createElement('td');
  const editBtn = document.createElement('button');
  const deleteBtn = document.createElement('button');

  expenceCategory.textContent = category + ' - ' + timestamp;
  editBtn.textContent = 'Edit'; 
  deleteBtn.textContent = 'Delete';
  
  editBtn.classList.add('editHistory');
  deleteBtn.classList.add('editHistory');
  historyExpenseEdit.classList.add('historyBtns');
  
  historyExpenseEdit.appendChild(editBtn);
  historyExpenseEdit.appendChild(deleteBtn);
  
  row2.appendChild(expenceCategory);
  row2.appendChild(historyExpenseEdit);
  
  table.appendChild(row2);      // adds the second row to the table

  // Adds funcunality to the "edit" button
  editBtn.addEventListener('click', () => {   
    // Add function for button                  // right now the show modal is used for testing
    categoryDialog.showModal();
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
    let incomeVal = incomeFixed.value;
    let expenseVal = expenseFixed.value;

    let data = {
      username,
      income: incomeVal,
      expenses: expenseVal,
      goal: 320,
    };

    await updateBudget(data);
    await updateUserValuesView();

    document.querySelector('.popup-container-fixed').classList.remove("active");
    incomeFixed.value = "";
    expenseFixed.value = "";
  };

  document.querySelector('.show-popup-income').onclick = () => {
    document.querySelector('.popup-container-income').classList.add("active");
    dropDownFetchCategoriesIncome();
  };
  document.querySelector('.close-btn-income').onclick = () => {
    document.querySelector('.popup-container-income').classList.remove("active");
  };
  document.querySelector('.save-btn-income').onclick = async () => {
    const valueCustomIncome = document.querySelector(".value-income");

    let name = nameCustomIncome.value;
    let value = valueCustomIncome.value;
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
    valueCustomIncome.value = "";

    location.reload();    // Reload page to update history
  };

  document.querySelector('.show-popup-expense').onclick = () => {
    document.querySelector('.popup-container-expense').classList.add("active");
    dropDownFetchCategoriesExpense();
  };
  document.querySelector('.close-btn-expense').onclick = () => {
    document.querySelector('.popup-container-expense').classList.remove("active");
  };
  document.querySelector('.save-btn-expense').onclick = async () => {
    const nameCustomExpense = document.querySelector(".name-expense");
    const valueCustomExpense = document.querySelector(".value-expense");
    const dropdownExpense = document.querySelector(".dropdown-expense");
    let category = dropdownExpense.value;

    let name = nameCustomExpense.value;
    let value = valueCustomExpense.value;
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
    nameCustomExpense.value = "";
    valueCustomExpense.value = "";
    
    location.reload();    // Reload page to update history
  };

  // Add more event listeners here
}

// TEST TIL DELETE CUSTOM (BEHOLD)

let items1 = [{
  name: "idtest",
  amount: 700,
  date: "2024-4-22 10",
  _id: "1713808910591"
}]
let items2 = [{
  name: "idtest",
  amount: 700,
  date: "2024-4-22 10",
  _id: "1713808010246"
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
  category: "munke",
  incomeOrExpense: "expense",
}

//deleteCustomData(dataForDeletionIncome);
//deleteCustomData(dataForDeletionExpense);



// Save to localStorage on input change
incomeFixed.addEventListener('input', function() {
  localStorage.setItem('incomeFixed', this.value);
});

expenseFixed.addEventListener('input', function() {
  localStorage.setItem('expenseFixed', this.value);
});

savingsFixed.addEventListener('input', function() {
  localStorage.setItem('savingsFixed', this.value);
});


//#####################
// INITIALIZATION
//##################### 
async function initialize() {
  await setupEventListeners();
  await updateUserValuesView();
  await fetchCategories();
  await fetchHistory();
}

// Call initialize to start the app
initialize();
