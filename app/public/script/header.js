/**
 * Initialise the page.
 * Set Event Listeners.
 * Set Theme.
 */
(function initialiseHeader() {
    // set event listeners
    const hamburger = document.querySelector("#hamburger-container");
    hamburger.addEventListener("click", handleHamburgerButtonClick);

    const themeButton = document.querySelector(".theme-change-button");
    themeButton.addEventListener("click", handleThemeButtonClick);

    const modalContainers = document.querySelectorAll('.modal-container');
    modalContainers.forEach(mc => mc.addEventListener('click', handleModalClick));

    // select theme
    const selectedTheme = localStorage.getItem("theme");
    let theme = "";
    switch (selectedTheme) {
        case "dark":
            theme = "dark";
            break;
        case "light":
        default:
            theme = "light";
            break;
    }
    setTheme(theme);
})();

function handleModalClick(event) {
    const clickedOnContainer = !event.target.closest('.modal');
    const clickedOnX = event.target.classList.contains('modal-close-button');
    if (clickedOnContainer || clickedOnX) {
        event.target.closest('.modal-container').classList.toggle('hidden');
    }
}

/**
 * Event handler for clicking the sun/ moon icon to change theme
 */
function handleThemeButtonClick() {
    setTheme(localStorage.getItem("theme") == "dark" ? "light" : "dark");
}

/**
 * Event handler for clicking hamburger button
 * @param {Event} event
 */
function handleHamburgerButtonClick(event) {
    if (!event.target.classList.contains("hamburger-source")) return;
    // const user = document.querySelector("#user-details-container");
    // const login = document.querySelector("#login-form-container");
    // const element = user || login;
    // element.toggleAttribute("hidden");
    document.querySelector('.modal-container').classList.remove('hidden');
}

/**
 * Set the current theme.
 * @param {string} theme `light` or `dark`
 */
function setTheme(theme) {
    if (theme != "light" && theme != "dark") return;

    localStorage.setItem("theme", theme);
    const body = document.querySelector("body");

    switch (theme) {
        case "dark":
            body.classList.add("dark");
            break;
        case "light":
        default:
            body.classList.remove("dark");
            break;
    }
}

function createModal(modalId) {

    //remove if already exists
    const currentDiv = document.querySelector('#' + modalId);
    if (currentDiv) currentDiv.remove();

    // create elements
    const modalContainer = document.createElement('div');
    // modalContainer.className = 'modal-container hidden';
    modalContainer.className = 'modal-container';
    modalContainer.id = modalId;

    const modal = document.createElement('div');
    modal.classList.add('modal');

    const modalCloseButton = document.createElement('div');
    // modalCloseButton.addEventListener('click', () => {
    // 	const thisModal = document.querySelector('#' + modalId);
    // 	if (thisModal) thisModal.remove();
    // 	//modalContainer.classList.add('hidden');
    // });
    modalCloseButton.addEventListener('click', () => handleCloseModal);
    modalCloseButton.textContent = '✕';
    modalCloseButton.classList.add('modal-close-button');

    const modalInnerDiv = document.createElement('div');
    modalInnerDiv.className = 'modalInnerDiv';
    modalInnerDiv.style.padding = '10px';

    // nest elements
    modal.append(modalCloseButton, modalInnerDiv);
    modalContainer.appendChild(modal);
    modalContainer.addEventListener('click', handleModalClick);

    return modalContainer;
}

function handleCloseModal(event) {
    const x = event.target.closest('.modal-container');
    if (x) x.remove();
}

function createDeleteUserConfirmModal() {

    // create modal
    const modalContainer = createModal('delete-account-confirmation-modal');

    //
    const wrapper = document.createElement('div');
    wrapper.className = 'flex-container centered-h centered-v col';
    wrapper.style.gap = '5px';


    const textConfirm = document.createElement('div');
    textConfirm.textContent = 'Are you sure you want to delete your account?';
    textConfirm.style.textAlign = 'center';

    const textInstruction = document.createElement('div');
    textInstruction.textContent = 'Type your username here if you really want to delete your account';
    textInstruction.style.fontSize = '0.75em';
    textInstruction.className = 'flex-container centered-h centered-v';
    textInstruction.style.textAlign = 'center';

    const texts = document.createElement('div');
    texts.className = 'flex-container centered-h col';
    texts.append(textConfirm, textInstruction);

    const confirmInput = document.createElement('input');
    confirmInput.setAttribute('type', 'text');
    confirmInput.setAttribute('placeholder', 'Confirm Username...');
    //confirmInput.style.width = '75%';
    confirmInput.id = 'account-delete-confirm-input';
    confirmInput.className = 'form-style-1';
    // confirmInput.style['box-sizing'] = 'border-box';
    // confirmInput.style.border = '1px solid var(--color-bg-2)';
    // confirmInput.style.borderRadius = 'var(--general-border-radius)'
    confirmInput.addEventListener('keyup', handleConfirmDeleteAccountKeyup)

    const buttons = document.createElement('div');
    buttons.className = 'flex-container centered-h centered-v row'
    buttons.style.gap = '10px';

    const span1 = document.createElement('span');
    const buttonYes = document.createElement('button');
    buttonYes.setAttribute('type', 'button');
    buttonYes.id = 'delete-account-yes';
    buttonYes.className = 'button-style-1 flex-container centered-h centered-v';
    buttonYes.textContent = 'Yes';
    span1.appendChild(buttonYes);

    buttonYes.addEventListener('click', handleConfirmAccountDeletion);

    const span2 = document.createElement('span');
    const buttonNo = document.createElement('button');
    buttonNo.setAttribute('type', 'button');
    buttonNo.id = 'delete-account-no';
    buttonNo.className = 'button-style-1 flex-container centered-h centered-v';
    buttonNo.textContent = 'No';
    buttonNo.addEventListener('click', handleCloseModal);
    span2.appendChild(buttonNo);

    buttons.append(span1, span2);
    wrapper.append(texts, confirmInput, buttons);

    modalContainer
        .querySelector('.modal')
        .querySelector('.modalInnerDiv')
        .append(wrapper);

    return modalContainer
}

function handleConfirmDeleteAccountKeyup(e) {
    console.log(username);
    console.log(username == e.target.value);
    const isEqual = username == e.target.value;
    if (isEqual) {
        e.target.classList.remove('invalid');
        e.target.classList.add('valid');
    } else {
        e.target.classList.add('invalid');
        e.target.classList.remove('valid');
    }
}

function handleConfirmAccountDeletion(event) {
    const confirmUsername = document.querySelector('#account-delete-confirm-input');
    if (confirmUsername.value == username) {
        console.log("This would delete");
        window.location = '/user/deleteuser?_mo=DELETE'
    } else {
        console.log("This would NOT delete");
    }
}