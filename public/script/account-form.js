const pwdConfirm = document.querySelector('#newpasswordconfirm');
console.log(pwdConfirm);
pwdConfirm.addEventListener('keyup', confirmPasswordHandler);

// Initialise Form

(function initialiseAccountForm() {
    const showChangePasswordButton = document.querySelector('#show-change-password');
    const changePasswordSubmitBtn = document.querySelector('#change-password-submit');

    showChangePasswordButton.addEventListener('click', handleShowChangePassword);
    changePasswordSubmitBtn.disabled = true;
})();

// Event Handlers

function handleShowChangePassword(event) {
    event.preventDefault();
    const changePasswordform = document.querySelector('#account-form-change-password');
    changePasswordform.classList.toggle('hidden');
}

function confirmPasswordHandler() {
    const newPwd = document.querySelector('#newpassword');
    const newPwdConfirm = document.querySelector('#newpasswordconfirm');
    console.log('====');
    console.log('new: ' + newPwd.value);
    console.log('new confirm: ' + newPwdConfirm.value);

    const submit = document.querySelector('#change-password-submit');
    if (newPwd.value !== newPwdConfirm.value) {
        newPwdConfirm.classList.add('form-input-validation-error');
        submit.disabled = true;
    } else {
        newPwdConfirm.classList.remove('form-input-validation-error');
        submit.disabled = false;
    }
    console.log('====');
}