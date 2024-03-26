
const showPopup = document.querySelector('.show-popup');
const popupContainer = document.querySelector('.popup-container');
const body = document.querySelector('body');
const closeBtn = document.querySelector('.close-btn');
const saveBtn = document.querySelector('.save-btn');

const income = document.querySelector('.income');
const expense = document.querySelector('.expense');

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
};
