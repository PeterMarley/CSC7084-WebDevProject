(function initialiseRegisterForm() {
    const usernameInput = document.querySelector('#username');
    const pwdInput = document.querySelector('#password');
    const pwdConfirmInput = document.querySelector('#password-confirm');
    const emailInput = document.querySelector('#email');

    const inputs = [usernameInput, pwdInput, pwdConfirmInput, emailInput];

    usernameInput.addEventListener('keyup', (event) => handleRegexTestInput(event, validateUsername));
    usernameInput.addEventListener('keyup', () => registerFormSubmittable(inputs));

    pwdInput.addEventListener('keyup', (event) => handleRegexTestInput(event, validatePassword));
    pwdInput.addEventListener('keyup', () => registerFormSubmittable(inputs));

    pwdConfirmInput.addEventListener('keyup', (event) => handleRegisterPasswordConfirmKeyup(event, validatePassword, pwdInput));
    pwdConfirmInput.addEventListener('keyup', () => registerFormSubmittable(inputs));

    emailInput.addEventListener('keyup', (event) => handleRegexTestInput(event, validateEmail));
    emailInput.addEventListener('keyup', () => registerFormSubmittable(inputs));
})();

function handleRegexTestInput(event, validator) {
    const input = event.target;
    if (validator(input.value)) {
        input.classList.add('valid');
        input.classList.remove('invalid');
    } else {
        input.classList.remove('valid');
        input.classList.add('invalid');
    }
}

function handleRegisterPasswordConfirmKeyup(event, validator, pwdInput) {
    const pwdConfirmInput = event.target;
    if (pwdInput.value === pwdConfirmInput.value && validator(pwdConfirmInput.value)) {
        pwdConfirmInput.classList.add('valid');
        pwdConfirmInput.classList.remove('invalid');
    } else {
        pwdConfirmInput.classList.remove('valid');
        pwdConfirmInput.classList.add('invalid');
    }
}

function registerFormSubmittable(elements) {
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