const hamburger = document.querySelector('#hamburger-container');

hamburger.addEventListener('click', () => {
    document.querySelector('#user-details-container').toggleAttribute('hidden');
})