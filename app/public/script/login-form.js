
(function initialiseLoginForm() {
    const registerBtn = document.querySelector('#register-button');
    if (registerBtn) registerBtn.addEventListener('click', () => window.location = '/user/register');

    const validations = [
        { sel: '#login-username-input', validationSel: 'login-form-validation-message-username', validator: validateUsername },
        { sel: '#login-password-input', validationSel: 'login-form-validation-message-password', validator: validatePassword },
    ]

    validations.forEach(v => {
        document
            .querySelector(v.sel)
            .addEventListener('keyup', () => handleValidation(v.sel, v.validationSel, v.validator));
    });

})();


function handleValidation(inputSelector, validationDivSelector, validatorFunc) {
    const input = document.querySelector(inputSelector);
    const validator = document.querySelector(validationDivSelector);
    if (validatorFunc(input.value)) {
        input.classList.remove('invalid');
        input.classList.add('valid');
        validationDivSelector.classList.add('hidden');
        return;
    }
    input.classList.add('invalid');
    input.classList.remove('valid');
    validationDivSelector.classList.remove('hidden');
}