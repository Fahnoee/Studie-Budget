console.log("LUUUUUUUUUUUURT");

const showPopup = document.querySelector('.show-popup');
const popupContainer = document.querySelector('.popup-container');
const body = document.querySelector('body');
const closeBtn = document.querySelector('.close-btn');

showPopup.onclick = () => {
    popupContainer.classList.add('active');
}

closeBtn.onclick = () => {
    popupContainer.classList.remove('active');
}