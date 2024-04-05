const showPopup = document.querySelector(".show-popup");
const popupContainer = document.querySelector(".popup-container");
const body = document.querySelector("body");
const closeBtn = document.querySelector(".close-btn");
const saveBtn = document.querySelector(".save-btn");

const income = document.querySelector(".income");
const expense = document.querySelector(".expense");

//const controller = require('../controllers/budgetController.js');

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
};
