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
        if (isSelected && index === -1) { // if selected, and not in array, add
            activitiesSelected.push(activityName);
        } else if (!isSelected && index !== -1) { // if unselected and in array, remove
            activitiesSelected.splice(index, 1);
        }
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