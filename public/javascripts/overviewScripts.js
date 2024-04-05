const showPopup = document.querySelector('.show-popup');
const popupContainer = document.querySelector('.popup-container');
const body = document.querySelector('body');
const closeBtn = document.querySelector('.close-btn');
const saveBtn = document.querySelector('.save-btn');
const pie = document.querySelector('.pie');
const income = document.querySelector(".income");
const expense = document.querySelector(".expense");


//const controller = require('../controllers/budgetController.js');

// Set current percentage to pie chart when loading the page
// setPiePercentage(40);

showPopup.onclick = () => {
  popupContainer.classList.add("active");
};

closeBtn.onclick = () => {
  popupContainer.classList.remove("active");
};

saveBtn.onclick = () => {
  let username = "John Doe";
  let incomeVal = income.value;
  let expenseVal = expense.value;

  let data = {
    username,
    income: incomeVal,
    expenses: expenseVal,
    goal: 320,
  };

  fetch("/api/update_budget", {
    // assuming '/api/update_budget' is your api endpoint in the backend
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      popupContainer.classList.remove("active");
    })
    .catch((error) => {
      console.error("Error:", error);
    });

    popupContainer.classList.remove("active");

  // Save changed income/expense to pie chart
  let getPieStyle = getComputedStyle(pie)
  let getPieValue = getPieStyle.getPropertyValue('--p');
  console.log("The value of --p is: " + getPieValue);

  setPiePercentage(expenseVal/incomeVal * 100);
};

function setPiePercentage(percent) {
    // Set the value of variable --p to another value (in this case 20)
    pie.style.setProperty('--p', percent);
    console.log("The value of --p is: " + pie.style.getPropertyValue('--p'));

    pie.classList.remove("animate");    // Reset animation
    void pie.offsetWidth;               // Trigger reflow
    pie.classList.add("animate");       // Start animation
    
  
  }


  