// let moodSelected = "";
// const activitiesSelected = [];
// const moodElements = document.querySelectorAll(".mood");
// const activityElements = document.querySelectorAll(".activity");

const entryFormComponents = {
    selected: {
        mood: "",
        activities: [],
    },
    activitySelection: document.querySelectorAll(".activity"),
    moodSelection: {
        positive: {
            container: document.querySelector('.mood-selection-container#positive-moods'),
            valenceButton: document.querySelector('.mood-valence-button#valence-positive'),
        },
        negative: {
            container: document.querySelector('.mood-selection-container#negative-moods'),
            valenceButton: document.querySelector('.mood-valence-button#valence-negative'),
        },
        buttons: document.querySelectorAll('.mood'),
        active: document.querySelector('#mood-valence-button-container').getAttribute('disabled') == 'false',
    }

    // action: document.querySelector('.mood-selection').dataset.action,
}
entryFormComponents.selected.mood;
/**
 * Initialise elements, and add event listeners
 */
(function intialiseMoodEntryForm() {
    // configure elements

    const activitiesDivs = document.querySelectorAll(".activity.selected");
    for (const div of activitiesDivs) {
        entryFormComponents.selected.activities.push(div.children[1].textContent);
    }
    const actHiddenInput = document.querySelector("#activities-hidden-input");
    actHiddenInput.value = entryFormComponents.selected.activities.join(",");

    const moodDiv = document.querySelector(".mood.selected");
    const moodHiddenInput = document.querySelector("#mood-hidden-input");

    moodHiddenInput.value = moodDiv ? moodDiv.children[1].textContent : "";
    entryFormComponents.selected.mood = moodDiv ? moodDiv.children[1].textContent : "";

    const valenceButtons = document.querySelectorAll('.mood-valence-button');
    valenceButtons.forEach(b => b.addEventListener('click', handleMoodValenceButtonClicks));

    // add event listeners

    entryFormComponents.moodSelection.buttons.forEach((moodSelectionButton) =>
        moodSelectionButton.addEventListener("click", () => handleMoodSelection(moodSelectionButton))
    );

    entryFormComponents.activitySelection.forEach((activityElement) =>
        activityElement.addEventListener("click", handleActivitySelection)
    );

    document
        .querySelector("#mood-entry-form-submit")
        .addEventListener("click", handleFormSubmission);

})();

/**
 * Event handler for user selecting an activity
 * @param {Element} activityElement 
 */
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

/**
 * Event handler for user selecting a mood
 * @param {Element} moodElement 
 */
function handleMoodSelection(moodElement) {
    if (!entryFormComponents.moodSelection.active) return;
    //console.log(document.querySelector('.mood-selection').dataset.action);
    entryFormComponents.moodSelection.buttons.forEach((el) => el.classList.remove("selected"));
    entryFormComponents.selected.mood = moodElement.querySelector(".mood-name").textContent;
    moodElement.classList.add("selected");
    entryFormComponents.selected.mood = moodElement.children[1].textContent;
    console.log("mood selected: " + entryFormComponents.selected.mood);
    validateSelectedMood();
}

/**
 * Event handler for a user submiting form
 */
function handleFormSubmission() {
    // console.log(entryFormComponents.selected.mood);
    // console.log(entryFormComponents.selected.activities);

    // const activitiesInput = document.querySelector("#activities-hidden-input");
    // activitiesInput.value = entryFormComponents.selected.activities.join(",");
    grabSelectedActivities();

    // const moodInput = document.querySelector("#mood-hidden-input");
    // moodInput.value = entryFormComponents.selected.mood;
    // const moodsValidated = grabSelectedMood();

    if (grabSelectedMood()) { // only mood is required for an entry
        const form = document.querySelector("#mood-entry-form");
        form.submit();
        // console.log('submit');
    }


}

function grabSelectedMood() {
    const { mood } = entryFormComponents.selected;
    const moodInput = document.querySelector("#mood-hidden-input");
    moodInput.value = mood
    return validateSelectedMood();
}

function validateSelectedMood() {
    const moodSelectionBox = document.querySelector('.mood-selection');
    const { mood } = entryFormComponents.selected;
    let validated = false;
    if (mood.length === 0) {
        moodSelectionBox.classList.add('form-input-validation-error');
        // console.log(1);
    } else {
        moodSelectionBox.classList.remove('form-input-validation-error');
        // console.log(2);
        validated = true;
    }
    return validated;
}

function grabSelectedActivities() {
    const activitiesInput = document.querySelector("#activities-hidden-input");
    activitiesInput.value = entryFormComponents.selected.activities.join(",");
}

function handleMoodValenceButtonClicks(event) {
    console.log("disabled? " + document.querySelector('#mood-valence-button-container').getAttribute('disabled'));

    if (!entryFormComponents.moodSelection.active) return;


    //FIXME redo the selection and mood/activity passthrough javascript
    const { positive, negative } = entryFormComponents.moodSelection;
    const buttonPressedId = event.target.id;
    console.log(buttonPressedId);

    if (buttonPressedId === 'valence-negative') {
        negative.valenceButton.classList.add('selected');
        positive.valenceButton.classList.remove('selected');

        negative.container.classList.remove('hidden');
        positive.container.classList.add('hidden');
    } else if (buttonPressedId === 'valence-positive') {
        negative.valenceButton.classList.remove('selected');
        positive.valenceButton.classList.add('selected');

        negative.container.classList.add('hidden');
        positive.container.classList.remove('hidden');
    }
}

// function validateSelectedActivities() {
//     const moodSelectionBox = document.querySelector('.mood-selection');
//     const { activities } = entryFormComponents.selected;
//     let validated = false;
//     if (activities.length === 0) {
//         moodSelectionBox.classList.add('form-input-validation-error');
//         // console.log(1);
//     } else {
//         moodSelectionBox.classList.remove('form-input-validation-error');
//         // console.log(2);
//         validated = true;
//     }
//     return validated;
// }

// when submit is pressed, if mood is not selected, highlight moods box in red
// when mood button is pressed and valid mood selected, remove error highlight

// when submit is pressed. if no activities are selected, that is acceptable, submit form

// when submit is pressed, if no notes are selected, is this ok?


