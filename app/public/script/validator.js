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