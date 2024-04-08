const showPopup = document.querySelector('.show-popup');
const popupContainer = document.querySelector('.popup-container');
const body = document.querySelector('body');
const closeBtn = document.querySelector('.close-btn');
const saveBtn = document.querySelector('.save-btn');
const pie = document.querySelector('.pie');
const income = document.querySelector(".income");
const expense = document.querySelector(".expense");
const totalAmount = document.querySelector(".total");
const spentAmount = document.querySelector(".spent");
const leftAmount = document.querySelector(".left");

updateUserValuesView(); // Paste current user values from database:

//#####################
// FUNCTIONS FOR POPUP
//#####################
// Function for popup
showPopup.onclick = () => {
  popupContainer.classList.add("active");     // Activates popup by adding class to div
};

// Function for the Close Button
closeBtn.onclick = () => {
  popupContainer.classList.remove("active");    // Deactivates popup by removing class from div
};

// Function for the Save Button
saveBtn.onclick = async() => {
  let username = "John Doe";
  let incomeVal = income.value;
  let expenseVal = expense.value;

  let data = {
    username,
    income: incomeVal,
    expenses: expenseVal,
    goal: 320,
  };

  await updateBudget(data);                     // Firstly update the budget  in the database with new values
  await updateUserValuesView();                 // Here we update the userValues showed within the piechart with values from database

  popupContainer.classList.remove("active");    // Deactivates popup by removing class from div
  
  // Save changed income/expense to pie chart
  let getPieStyle = getComputedStyle(pie)
  let getPieValue = getPieStyle.getPropertyValue('--p');
  console.log("The value of --p is: " + getPieValue);
};


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
    popupContainer.classList.remove("active");    // Close popup when response was sucessful and data has been updated
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