
(function initialiseLoginForm() {
    const registerBtn = document.querySelector('#register-button');
    if (registerBtn) registerBtn.addEventListener('click', () => window.location = '/user/register');

    const validations = [
        { sel: '#login-username-input', validator: validateUsername },
        { sel: '#login-password-input', validator: validatePassword },
    ]

    validations.forEach(v => {
        document
            .querySelector(v.sel)
            .addEventListener('keyup', () => handleValidation(v.sel, v.validator));
    });

})();


function handleValidation(inputSelector, validatorFunc) {
    const input = document.querySelector(inputSelector);
    if (validatorFunc(input.value)) {
        input.classList.remove('invalid');
        return;
    }
    input.classList.add('invalid');
}