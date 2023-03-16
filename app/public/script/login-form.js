
(function initialiseLoginForm() {
    const registerBtn = document.querySelector('#register-button');
    if (registerBtn) registerBtn.addEventListener('click', () => window.location = '/user/register');

    const validations = [
        { sel: '#login-username-input', validationSel: '#login-form-validation-message-username', validator: validateUsername },
        { sel: '#login-password-input', validationSel: '#login-form-validation-message-password', validator: validatePassword },
    ]

    validations.forEach(v => {
        document
            .querySelector(v.sel)
            .addEventListener('keyup', () => handleValidation(v.sel, v.validationSel, v.validator));
    });

    document
        .querySelector('#login-submit')
        .addEventListener('click', (event) => handleLoginSubmission(event, validations))
})();


function handleValidation(inputSelector, validationDivSelector, validatorFunc) {
    const input = document.querySelector(inputSelector);
    const validator = document.querySelector(validationDivSelector);
    if (validatorFunc(input.value)) {
        input.classList.remove('invalid');
        input.classList.add('valid');
        validator.classList.add('hidden');
        input.parentNode.querySelector('.validation-message-div').classList.add('hidden');
        return;
    }
    input.classList.add('invalid');
    input.classList.remove('valid');
}

function handleLoginSubmission(event, validations) {
    event.preventDefault();

    for (const v of validations) handleValidation(v.sel, v.validationSel, v.validator);

    const inputs = document.querySelectorAll('.login-input');

    let allValid = true;
    for (const i of inputs) {
        if (i.classList.contains('invalid')) {
            allValid = false;
            i.parentNode
                .querySelector('.validation-message-div')
                .classList
                .remove('hidden');
        }
    }
    if (allValid) document.querySelector('#login-form').submit();
}

function disableHamburger() {
    document.querySelector('#hamburger-container').remove();
    document.querySelector('#hamburger-modal').remove();
}