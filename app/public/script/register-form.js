(function initialiseRegisterForm() {
    const usernameInput = document.querySelector('#username');
    const pwdInput = document.querySelector('#password');
    const pwdConfirmInput = document.querySelector('#password-confirm');
    const emailInput = document.querySelector('#email');

    const inputs = [usernameInput, pwdInput, pwdConfirmInput, emailInput];
    usernameInput.addEventListener('keyup', (event) => handleValidation(event, validateUsername));
    pwdInput.addEventListener('keyup', handlePasswordsValidation);
    pwdConfirmInput.addEventListener('keyup', handlePasswordsValidation);
    emailInput.addEventListener('keyup', (event) => handleValidation(event, validateEmail));

    inputs.forEach(input => {
        input.dispatchEvent(new Event('keyup'));
        input.addEventListener('keyup', () => checkRegisterFormIsSubmittable(inputs));
    });
    checkRegisterFormIsSubmittable(inputs);
})();

function handlePasswordsValidation(e) {
    const pwdInput = document.querySelector('#password');
    if (validatePassword(pwdInput.value)) {
        pwdInput.classList.add('valid');
        pwdInput.classList.remove('invalid');
    } else {
        pwdInput.classList.remove('valid');
        pwdInput.classList.add('invalid');
    }

    const pwdConfirmInput = document.querySelector('#password-confirm');
    if (pwdInput.value === pwdConfirmInput.value && validatePassword(pwdConfirmInput.value)) {
        pwdConfirmInput.classList.add('valid');
        pwdConfirmInput.classList.remove('invalid');
    } else {
        pwdConfirmInput.classList.remove('valid');
        pwdConfirmInput.classList.add('invalid');
    }
}

function handleValidation(event, validateCallback) {
    const input = event.target;
    if (validateCallback(input.value.trim())) {
        input.classList.add('valid');
        input.classList.remove('invalid');
    } else {
        input.classList.remove('valid');
        input.classList.add('invalid');
    }
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