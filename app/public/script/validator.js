function validateUsername(username) {
    let valid = false;
    try {
        valid = usernameRegex.test(username);
    } catch {
        console.log('validating username failed.');
    }
    return valid;
}

function validatePassword(password) {
    let valid = false;
    try {
        valid = passwordRegex.test(password);
    } catch {
        console.log('validating password failed.');
    }
    return valid;
}

function validateEmail(email) {
    let valid = false;
    try {
        valid = emailRegex.test(email);
    } catch {
        console.log('validating email failed.');
    }
    return valid;
}

function handleValidateContext(e, regex) {
    const el = e.target;
    console.log(el.value);
    console.log(regex);
    if (regex.test(el.value)) {
        el.classList.remove('invalid');
        el.classList.add('valid');
    } else {
        el.classList.add('invalid');
        el.classList.remove('valid');
    }
}

function handleValidateInput(inputSelector, validationDivSelector, validatorFunc) {
    const input = document.querySelector(inputSelector);
    const validator = document.querySelector(validationDivSelector);
    if (validatorFunc(input.value)) {
        input.classList.remove('invalid');
        input.classList.add('valid');
        if (!validationDivSelector) validator.classList.add('hidden');
        if (!validationDivSelector) input.parentNode.querySelector('.validation-message-div').classList.add('hidden');
        return;
    }
    input.classList.add('invalid');
    input.classList.remove('valid');
}

function handleValidatePasswordInputsTogether(e) {
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

function handleShowPasswordInputs(passwordSelector) {
    const passwordInput = document.querySelector(passwordSelector);
    const value = passwordInput.getAttribute('type');
    passwordInput.setAttribute('type', value == 'password' ? 'text' : 'password');
}