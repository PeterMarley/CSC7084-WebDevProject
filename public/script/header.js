const hamburger = document.querySelector('#hamburger-container');
hamburger.addEventListener('click', (e) => {
    if (!e.target.classList.contains('hamburger-source')) return;
    const selector = document.querySelector('#loggedin').textContent === 'true'
        ? '#user-details-container'
        : '#login-form-container';
    document.querySelector(selector).toggleAttribute('hidden');
})