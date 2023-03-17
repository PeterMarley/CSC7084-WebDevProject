
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
            .addEventListener('keyup', () => handleValidateInput(v.sel, v.validationSel, v.validator));
    });

    document
        .querySelector('#login-submit')
        .addEventListener('click', (event) => handleLoginSubmission(event, validations))
})();

function handleLoginSubmission(event, validations) {
    event.preventDefault();

    for (const v of validations) handleValidateInput(v.sel, v.validationSel, v.validator);

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