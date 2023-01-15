let moodSelected = '';

const moodElements = document.querySelectorAll('.mood');
moodElements.forEach(e => {
    e.addEventListener('click', () => {
        moodElements.forEach(el => el.classList.remove('selected'));
        moodSelected = e.querySelector('.mood-name').textContent;
        e.classList.add('selected');
        moodSelected = e.children[1].textContent;
        console.log('mood selected: ' + moodSelected);
    });
});

const activitiesSelected = [];

const activityElements = document.querySelectorAll('.activity');
activityElements.forEach(e => {
    e.addEventListener('click', () => {
        e.classList.toggle('selected');
        const activityName = e.children[1].textContent;
        const isSelected = e.classList.contains('selected');
        const index = activitiesSelected.findIndex(e => e === activityName);
        const actHiddenInput = document.querySelector('#activities-hidden-input');
        if (isSelected && index === -1) { // if selected, and not in array, add
            activitiesSelected.push(activityName);
        } else if (!isSelected && index !== -1) { // if unselected and in array, remove
            activitiesSelected.splice(index, 1);
        }
        actHiddenInput.value=activitiesSelected.join(',');
        console.log(actHiddenInput.value);

    });
});

document.querySelector('#mood-entry-form-submit').addEventListener('click', handleFormSubmission);

function handleFormSubmission() {
    const activitiesInput = document.querySelector('#activities-hidden-input');
    activitiesInput.value = activitiesSelected.join(',');

    const moodInput = document.querySelector('#mood-hidden-input');
    moodInput.value = moodSelected;
    
    const form = document.querySelector('#mood-entry-form');
    form.submit();
}

(function setup() {
    const activitiesDivs = document.querySelectorAll('.activity.selected');
    for (const div of activitiesDivs) {
        activitiesSelected.push(div.children[1].textContent);
    }
    const actHiddenInput = document.querySelector('#activities-hidden-input');
    actHiddenInput.value = activitiesSelected.join(',');

    const moodDiv = document.querySelector('.mood.selected');
    const moodHiddenInput = document.querySelector('#mood-hidden-input');
    moodHiddenInput.value = moodDiv.children[1].textContent;
    moodSelected = moodDiv.children[1].textContent;

    console.log('activities selected');
    console.log(activitiesSelected);
    console.log('mood selected');
    console.log(moodSelected);
})();