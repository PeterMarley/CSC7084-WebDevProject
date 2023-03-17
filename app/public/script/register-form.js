(function initialiseRegisterForm() {
    // const usernameInput = document.querySelector('#username');
    // const pwdInput = document.querySelector('#password');
    // const pwdConfirmInput = document.querySelector('#password-confirm');
    // const emailInput = document.querySelector('#email');

    // const inputs = [usernameInput, pwdInput, pwdConfirmInput, emailInput];
    // usernameInput.addEventListener('keyup', (event) => handleValidation(event, validateUsername));
    // pwdInput.addEventListener('keyup', handlePasswordsValidation);
    // pwdConfirmInput.addEventListener('keyup', handlePasswordsValidation);
    // emailInput.addEventListener('keyup', (event) => handleValidation(event, validateEmail));

    // inputs.forEach(input => {
    //     input.dispatchEvent(new Event('keyup'));
    //     input.addEventListener('keyup', () => checkRegisterFormIsSubmittable(inputs));
    // });
    // checkRegisterFormIsSubmittable(inputs);
    const registrationValidations = [
        { sel: '#username', validationSel: '#register-form-validation-message-username', validator: validateUsername },
        { sel: '#password', validationSel: '#register-form-validation-message-password', validator: validatePassword },
        { sel: '#password-confirm', validationSel: '#register-form-validation-message-password-confirm', validator: validatePassword },
        { sel: '#email', validationSel: '#register-form-validation-message-email', validator: validateEmail },
    ]

    registrationValidations.forEach(v => {
        document
            .querySelector(v.sel)
            .addEventListener('keyup', () => handleValidateInput(v.sel, v.validationSel, v.validator));
    });

    const passwordInputs = [document.querySelector('#password'), document.querySelector('#password-confirm')]
    passwordInputs.forEach(pi => pi.addEventListener('keyup', handleValidatePasswordInputsTogether));

    document
        .querySelector('#register-account-submit')
        .addEventListener('click', (event) => handleRegisterSubmission(event, registrationValidations))
})();

function handleRegisterSubmission(event, validations) {
    event.preventDefault();

    for (const v of validations) handleValidateInput(v.sel, v.validationSel, v.validator);

    const inputs = document.querySelectorAll('.register-input');

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
    if (allValid) document.querySelector('#registration-form').submit();
}

function checkRegisterFormIsSubmittable(elements) {
    const registerBtn = document.querySelector('#register-account-submit');
    for (let element of elements) {
        console.log(element);
        if (!element.classList.contains('valid')) {
            registerBtn.disabled = true;
            return;
        }
    }
    registerBtn.disabled = false;
}