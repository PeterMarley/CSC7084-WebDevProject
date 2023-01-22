let moodSelected = "";
const activitiesSelected = [];
const moodElements = document.querySelectorAll(".mood");
const activityElements = document.querySelectorAll(".activity");

/**
 * Initialise elements, and add event listeners
 */
(function intialiseMoodEntryForm() {
    
    // configure elements

    const activitiesDivs = document.querySelectorAll(".activity.selected");
    for (const div of activitiesDivs) {
        activitiesSelected.push(div.children[1].textContent);
    }
    const actHiddenInput = document.querySelector("#activities-hidden-input");
    actHiddenInput.value = activitiesSelected.join(",");

    const moodDiv = document.querySelector(".mood.selected");
    const moodHiddenInput = document.querySelector("#mood-hidden-input");

    moodHiddenInput.value = moodDiv ? moodDiv.children[1].textContent : "";
    moodSelected = moodDiv ? moodDiv.children[1].textContent : "";

    // add event listeners

    moodElements.forEach((moodElement) =>
        moodElement.addEventListener("click", () => handleMoodSelection(moodElement))
    );

    activityElements.forEach((activityElement) =>
        activityElement.addEventListener("click", () => handleActivitySelection(activityElement))
    );

    document
        .querySelector("#mood-entry-form-submit")
        .addEventListener("click", handleFormSubmission);

    // console.log('activities selected');
    // console.log(activitiesSelected);
    // console.log('mood selected');
    // console.log(moodSelected);
})();

/**
 * Event handler for user selecting an activity
 * @param {Element} activityElement 
 */
function handleActivitySelection(activityElement) {
    activityElement.classList.toggle("selected");
    const activityName = activityElement.children[1].textContent;
    const isSelected = activityElement.classList.contains("selected");
    const index = activitiesSelected.findIndex((e) => e === activityName);
    const actHiddenInput = document.querySelector("#activities-hidden-input");
    if (isSelected && index === -1) {
        // if selected, and not in array, add
        activitiesSelected.push(activityName);
    } else if (!isSelected && index !== -1) {
        // if unselected and in array, remove
        activitiesSelected.splice(index, 1);
    }
    actHiddenInput.value = activitiesSelected.join(",");
    console.log(actHiddenInput.value);
}

/**
 * Event handler for user selecting a mood
 * @param {Element} moodElement 
 */
function handleMoodSelection(moodElement) {
    moodElements.forEach((el) => el.classList.remove("selected"));
    moodSelected = moodElement.querySelector(".mood-name").textContent;
    moodElement.classList.add("selected");
    moodSelected = moodElement.children[1].textContent;
    console.log("mood selected: " + moodSelected);
}

/**
 * Event handler for a user submiting form
 */
function handleFormSubmission() {
    console.log(moodSelected);
    console.log(activitiesSelected);

    const activitiesInput = document.querySelector("#activities-hidden-input");
    activitiesInput.value = activitiesSelected.join(",");

    const moodInput = document.querySelector("#mood-hidden-input");
    moodInput.value = moodSelected;

    const form = document.querySelector("#mood-entry-form");
    form.submit();
}
