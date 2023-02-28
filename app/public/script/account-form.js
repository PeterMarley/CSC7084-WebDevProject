
const accountFormElements = {
    buttonShowChangePassword: document.querySelector('#show-change-password'),
    buttonSubmitChangePassword: document.querySelector('#change-password-submit'),
    inputNewPwdConfirm: document.querySelector('#newpasswordconfirm'),
    inputNewPwd: document.querySelector('#newpassword'),
};
// Initialise Form

(function initialiseAccountForm() {
    const { buttonShowChangePassword, buttonSubmitChangePassword, inputNewPwdConfirm, inputNewPwd } = accountFormElements;

    buttonShowChangePassword.addEventListener('click', handleShowChangePassword);
    inputNewPwdConfirm.addEventListener('keyup', handleConfirmPasswordValidation);
    inputNewPwd.addEventListener('keyup', handleConfirmPasswordValidation);
    buttonSubmitChangePassword.disabled = true;
})();

// Event Handlers

function handleShowAccountDelete(event) {
    event.preventDefault();
    const showButton = document.querySelector('#delete-account-button');
}

function handleShowChangePassword(event) {
    event.preventDefault();
    const changePasswordform = document.querySelector('#account-form-change-password');
    changePasswordform.classList.toggle('hidden');
}

function handleConfirmPasswordValidation() {
    const { buttonSubmitChangePassword, inputNewPwdConfirm, inputNewPwd } = accountFormElements;


    if (inputNewPwd.value !== inputNewPwdConfirm.value) {
        inputNewPwdConfirm.classList.add('form-input-validation-error');
        inputNewPwdConfirm.classList.remove('valid');
        inputNewPwd.classList.remove('valid');
        buttonSubmitChangePassword.disabled = true;
    } else {
        inputNewPwdConfirm.classList.remove('form-input-validation-error');
        inputNewPwdConfirm.classList.add('valid');
        inputNewPwd.classList.add('valid');
        buttonSubmitChangePassword.disabled = false;
    }
}