(function initialiseContextForm() {
    const actNames = document.querySelectorAll(".activity>input:first-child");
    const actUrls = document.querySelectorAll(".activity>input:nth-child(2)");
    const newActName = document.querySelector('#new-activity-name');
    actNames.forEach(el => el.addEventListener('keyup', (event) => handleValidateContext(event, contextNameRegex)));
    actUrls.forEach(el => el.addEventListener('keyup', (event) => handleValidateContext(event, contextImgUrlRegex)));
    newActName.addEventListener('keyup', (event) => handleValidateContext(event, contextNameRegex));
})();

