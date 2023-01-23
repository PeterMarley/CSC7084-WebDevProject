/**
 * Initialise the page.
 * Set Event Listeners.
 * Set Theme.
 */
(function initialiseHeader() {
  // set event listeners
  const hamburger = document.querySelector("#hamburger-container");
  hamburger.addEventListener("click", handleHamburgerButtonClick);

  const themeButton = document.querySelector(".theme");
  themeButton.addEventListener("click", handleThemeButtonClick);

  const navMenuArrow = document.querySelector('#nav-menu-arrow')
  navMenuArrow.addEventListener('click', () => {
    const navMenuDropdown = document.querySelector('#nav-menu-dropdown');
    navMenuDropdown.classList.toggle('selected');
    //TODO sort nav menu drop down appearing when down arrow clicked
  });

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
  const user = document.querySelector("#user-details-container");
  const login = document.querySelector("#login-form-container");
  const element = user || login;
  element.toggleAttribute("hidden");
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
