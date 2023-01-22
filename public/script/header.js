const hamburger = document.querySelector('#hamburger-container');
const themeButton = document.querySelector('.theme');

hamburger.addEventListener('click', handleHamburgerClick);
themeButton.addEventListener('click', handleThemeClick);

function handleThemeClick() {
    document.querySelector('body').classList.toggle('dark');
    const selectedTheme = localStorage.getItem('theme');
    localStorage.setItem('theme', selectedTheme == 'dark' ? 'light' : 'dark');
}

function handleHamburgerClick(event) {
    if (!event.target.classList.contains('hamburger-source')) return;
    const user = document.querySelector('#user-details-container');
    const login = document.querySelector('#login-form-container');
    const element = user || login;
    element.toggleAttribute('hidden');
}

(function setup() {
    const selectedTheme = localStorage.getItem('theme');
    switch (selectedTheme) {
        case 'light':
            localStorage.setItem('theme', 'dark');
            break;
        case 'dark':
        default:
            localStorage.setItem('theme', 'light');
            break;
    }
    handleThemeClick();
})();