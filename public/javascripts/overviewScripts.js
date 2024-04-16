
const body = document.querySelector('body');
const pie = document.querySelector('.pie');
const totalAmount = document.querySelector(".total");
const spentAmount = document.querySelector(".spent");
const leftAmount = document.querySelector(".left");


//#####################
// Q-SELECTORS POPUPS
//#####################

// FIXED
const showPopupFixed = document.querySelector('.show-popup-fixed');
const popupContainerFixed = document.querySelector('.popup-container-fixed');
const closeBtnFixed = document.querySelector('.close-btn-fixed');
const saveBtnFixed = document.querySelector('.save-btn-fixed');
const incomeFixed = document.querySelector(".income-fixed");
const expenseFixed = document.querySelector(".expense-fixed");

//EXPENSE
const showPopupCustomExpense = document.querySelector('.show-popup-expense');
const popupContainerCustomExpense = document.querySelector('.popup-container-expense');
const closeBtnCustomExpense = document.querySelector('.close-btn-expense');
const saveBtnCustomExpense = document.querySelector('.save-btn-expense');
const categoryCustomExpense = document.querySelector(".category-expense");
const nameCustomExpense = document.querySelector(".name-expense");
const valueCustomExpense = document.querySelector(".value-expense");

//INCOME
const showPopupCustomIncome = document.querySelector('.show-popup-income');
const popupContainerCustomIncome = document.querySelector('.popup-container-income');
const closeBtnCustomIncome = document.querySelector('.close-btn-income');
const saveBtnCustomIncome = document.querySelector('.save-btn-income');
const categoryCustomIncome = document.querySelector(".category-income");
const nameCustomIncome = document.querySelector(".name-income");
const valueCustomIncome = document.querySelector(".value-income");


updateUserValuesView(); // Paste current user values from database:

//#####################
// FUNCTIONS FOR POPUP
//#####################

////////FIXED INCOMES/ EXPENSES

// Function for popup
showPopupFixed.onclick = () => {
  popupContainerFixed.classList.add("active");     // Activates popup by adding class to div
};
// Function for the Close Button
closeBtnFixed.onclick = () => {
  popupContainerFixed.classList.remove("active");    // Deactivates popup by removing class from div
};

// Function for the Save Button
saveBtnFixed.onclick = async() => {
  let username = "John Doe";
  let incomeVal = incomeFixed.value;
  let expenseVal = expenseFixed.value;

  let data = {
    username,
    income: incomeVal,
    expenses: expenseVal,
    goal: 320,
  };

  await updateBudget(data);                     // Firstly update the budget  in the database with new values
  await updateUserValuesView();                 // Here we update the userValues showed within the piechart with values from database

  popupContainerFixed.classList.remove("active");    // Deactivates popup by removing class from div
  
  // Save changed income/expense to pie chart
  let getPieStyle = getComputedStyle(pie)
  let getPieValue = getPieStyle.getPropertyValue('--p');
  console.log("The value of --p is: " + getPieValue);
};


//////// CUSTOM INCOME /////////////////

showPopupCustomIncome.onclick = () => {
  popupContainerCustomIncome.classList.add("active");     // Activates popup by adding class to div
};
// Function for the Close Button
closeBtnCustomIncome.onclick = () => {
  popupContainerCustomIncome.classList.remove("active");    // Deactivates popup by removing class from div
};

saveBtnCustomIncome.onclick = async() => {
  let username = "John Doe";
  let category = categoryCustomIncome.value;

  // Extracting value from inputfields
  let name = nameCustomIncome.value;
  let value = valueCustomIncome.value;
  
  //Packaging
  let items = [{"name": name, "amount": value}];

  let dataIncome = {
    username,
    customIncome: items,
    category: category,
  };
  
  updateCustomIncome(dataIncome);
  popupContainerCustomIncome.classList.remove("active");
};

//////// CUSTOM EXPENSE /////////////////

showPopupCustomExpense.onclick = () => {
  popupContainerCustomExpense.classList.add("active");     // Activates popup by adding class to div
};
// Function for the Close Button
closeBtnCustomExpense.onclick = () => {
  popupContainerCustomExpense.classList.remove("active");    // Deactivates popup by removing class from div
};

saveBtnCustomExpense.onclick = async() => {
  let username = "John Doe";
  let category = categoryCustomExpense.value;

  // Extracting value from inputfields
  let name = nameCustomExpense.value;
  let value = valueCustomExpense.value;
  
  //Packaging
  let items = [{"name": name, "amount": value}];

  let dataExpense = {
    username,
    customExpense: items,
    category: category,
  };
  
  updateCustomExpense(dataExpense);
  popupContainerCustomExpense.classList.remove("active");
};



/*
let username = "John Doe";
let category = "testCategory"
let items = [{"name": "testName", "amount": 6969}]

let dataExpense = {
  username,
  customExpense: items,
  category: category,
};

let dataIncome = {
  username,
  customIncome: items,
  category: category,
};
updateCustomExpense(dataExpense);
updateCustomIncome(dataIncome);
*/


//Function to add expense
//Function to add income


//############################ 
// FUNCTIONS FOR DATAHANDELING
//############################

//GET from database --- read data from database
async function fetchDatabase() {                  // A function for getting the values from budget from a user in the database and returns the budget.
  try {
      const response = await fetch("/api/budget/:budgetID", { // Put the data from fetch call into "response" const
          method: "GET",
          headers: {
              "Content-Type": "application/json",
          },
      });
      const data = await response.json(); // Parse the respons as a JSON and put in "const data"
      console.log("Success: ", data);
      return data; // Return the data obtained from the fetch call
  } catch (error) {
      console.error("Error: ", error);
      throw error; // Re-throw the error to handle it elsewhere if needed
  }
}
// POST to database --- Update Budget in database
async function updateBudget(data) {         // A function to update the data by sending a request to the server API endpoint
  try {
    const response = await fetch("/api/update_budget", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data), // convert data to JSON
    });

    if (!response.ok) {
      throw new Error("Failed to update budget");
    }

    const responseData = await response.json();   // Parse the response as a JSON and put it in responseData
    console.log("Success:", responseData);
    popupContainerFixed.classList.remove("active");    // Close popup when response was sucessful and data has been updated
  } catch (error) {
    console.error("Error:", error);
  }
}

async function updateCustomExpense(dataExpense) {         // A function to update the custom expense data
  try {
    const response = await fetch("/api/addcustom/expense", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataExpense), // convert data to JSON
    });

    if (!response.ok) {
      throw new Error("Failed to update budget");
    }

    const responseData = await response.json();   // Parse the response as a JSON and put it in responseData
    console.log("Success:", responseData);
    //popupContainer.classList.remove("active"); NY POPUP FOR CUSTOM
  } catch (error) {
    console.error("Error:", error);
  }
}

async function updateCustomIncome(dataIncome) {         // A function to update the custom income data
  try {
    const response = await fetch("/api/addcustom/income", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataIncome), // convert data to JSON
    });

    if (!response.ok) {
      throw new Error("Failed to update budget");
    }

    const responseData = await response.json();   // Parse the response as a JSON and put it in responseData
    console.log("Success:", responseData);
    //popupContainer.classList.remove("active"); NY POPUP FOR CUSTOM
  } catch (error) {
    console.error("Error:", error);
  }
}

// Use values from database to display visually in the pie chart --- Uses GET function
async function updateUserValuesView() {
  try {
    const data = await fetchDatabase();       // Call fetchDatabase and get userbudget-data returned.
    // Use the data returned by the function
    console.log("Returned Data: ", data);
    // Update UI with fetched data
    totalAmount.textContent = "Total: " + data.income;      // Place data into variables
    spentAmount.textContent = "Spent: " + data.expenses;
    leftAmount.textContent = "Available: " + (data.income - data.expenses);
    setPiePercentage(data.expenses / data.income * 100);    // Calculates the percentage that need to be painted
  } catch (error) {
    // Handle any errors
    console.error("Error: ", error);
  }
}

// Method for opdating the circle on the pie charts
function setPiePercentage(percent) {
    // Set the value of variable --p to another value (in this case 20)
    pie.style.setProperty('--p', percent);
    console.log("The value of --p is: " + pie.style.getPropertyValue('--p'));

    pie.classList.remove("animate");    // Reset animation
    void pie.offsetWidth;               // Trigger reflow
    pie.classList.add("animate");       // Start animation
}


function addCustomExpense(){
  
}