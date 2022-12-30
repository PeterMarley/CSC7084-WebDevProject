const moodElements = document.querySelectorAll('.mood');
moodElements.forEach(e => {
    e.addEventListener('click', () => {
        moodElements.forEach(el => el.classList.remove('selected'));
        e.classList.add('selected');
    })
});

const activityElements = document.querySelectorAll('.activity');
activityElements.forEach(e => {
    e.addEventListener('click', () => e.classList.toggle('selected'));
});
