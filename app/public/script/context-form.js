(function initialiseContextForm() {
    const actNames = document.querySelectorAll(".activity>input:first-child");
    const actUrls = document.querySelectorAll(".activity>input:nth-child(2)");
    let i = 0;
    // for (let i = 1; i < acts.length; i++) {
    //     acts[i].addEventListener('keyup', () => handleValidateInput('.activity-' + i + '>input:first-child', null, ))
    // }
    actNames.forEach(el => el.addEventListener('keyup', (event) => handleValidateContext(event, contextNameRegex)));
    actUrls.forEach(el => el.addEventListener('keyup', (event) => handleValidateContext(event, contextImgUrlRegex)));
})();

function handleActivitySelection(event) {
    const activityElement = event.target.closest('.activity');
    activityElement.classList.toggle("selected");
    const activityName = activityElement.children[1].textContent;
    const isSelected = activityElement.classList.contains("selected");
    const index = entryFormComponents.selected.activities.findIndex((e) => e === activityName);
    const actHiddenInput = document.querySelector("#activities-hidden-input");
    if (isSelected && index === -1) {
        // if selected, and not in array, add
        entryFormComponents.selected.activities.push(activityName);
    } else if (!isSelected && index !== -1) {
        // if unselected and in array, remove
        entryFormComponents.selected.activities.splice(index, 1);
    }
    actHiddenInput.value = entryFormComponents.selected.activities.join(",");
    console.log(actHiddenInput.value);
}