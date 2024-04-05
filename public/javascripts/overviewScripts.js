
const showPopup = document.querySelector('.show-popup');
const popupContainer = document.querySelector('.popup-container');
const body = document.querySelector('body');
const closeBtn = document.querySelector('.close-btn');
const saveBtn = document.querySelector('.save-btn');
const pie = document.querySelector('div.pie');

const income = document.querySelector('.income');
const expense = document.querySelector('.expense');

// Set current percentage to pie chart when loading the page
// setPiePercentage(40);

showPopup.onclick = () => {
    popupContainer.classList.add('active');
}

closeBtn.onclick = () => {
    popupContainer.classList.remove('active');
}

saveBtn.onclick = () => {

    //////////////////////////////////////////////HER SKAL DER INDSÆTTES RIGTIGE BRUGER NAVN
    let username;
    username = "John Doe";

    let incomeVal = income.value;
    let expenseVal = expense.value;
    console.log(incomeVal, expenseVal);

    /*try {
        await budgetFunctions.updateBudget(username, {     ///bruger username til at updatere budgetten.
            income: incomeVal,
            expenses: expenseVal,
        });
        popupContainer.classList.remove('active');
    } catch (error){
        console.log("fejl:" + error);
    }*/
    popupContainer.classList.remove('active');

    // Save changed income/expense to pie chart
    let getPieStyle = getComputedStyle(pie)
    let getPieValue = getPieStyle.getPropertyValue('--p');
    console.log("The value of --p is: " + getPieValue);

    setPiePercentage(20);
};

function setPiePercentage(percent) {
    // Set the value of variable --p to another value (in this case 20)
    pie.style.setProperty('--p', percent);
    console.log("The value of --p is: " + pie.style.getPropertyValue('--p'));
  }