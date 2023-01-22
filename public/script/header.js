const hamburger = document.querySelector('#hamburger-container');
hamburger.addEventListener('click', handleHamburgerClick);

function handleHamburgerClick(event) {
    if (!event.target.classList.contains('hamburger-source')) return;
    const user = document.querySelector('#user-details-container');
    const login  = document.querySelector('#login-form-container');
    const element = user||login;
    element.toggleAttribute('hidden');
}