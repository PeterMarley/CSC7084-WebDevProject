
(function initialiseLoginForm() {
    const registerBtn = document.querySelector('#register-button');
    if (registerBtn) registerBtn.addEventListener('click', () => window.location = '/user/register');
})();

