


function initialiseCharts() {
    // const { activities, moods, map } = processData(dataClient);
    const activityToFreqMap = new Map();
    dataClient.relationships.activityMoodRelationships.forEach(element => {
        if (!activityToFreqMap.get(element.activity)) {
            const moodOccurances = {};
            dataClient.relationships.activityMoodRelationships.forEach(e => {
                if (e.activity === element.activity && !Object.hasOwnProperty(e.mood))
                    moodOccurances[e.mood] = e.frequency;
            });
            activityToFreqMap.set(element.activity, moodOccurances);
        }
    });

    const charts = new Charts();
    const basic = charts.basic();
    const valence = charts.valence();
    const arousal = charts.arousal();
    
    const container = document.querySelector('#relationship-buttons-container');
    for (const record of activityToFreqMap) {
        const [activity, frequency] = record;
        const button = document.createElement('span');
        button.classList.add('button-style-1');
        button.textContent = activity;
        button.addEventListener('click', () => charts.relationship(activity, frequency));
        container.appendChild(button);
    }
};

class Charts {
    static red = '#bf212f';
    static green = '#27b376';
    arousal() {
        return new Chart(document.getElementById('arousal-chart'), {
            type: 'doughnut',
            data: {
                labels: dataClient.frequencies.arousal.map(d => d.name),
                datasets: [{
                    label: 'Summary of Arousal',
                    data: dataClient.frequencies.arousal.map(d => Number(d.frequency)),
                    backgroundColor: [Charts.green, Charts.red],
                    // borderColor: ['black'],
                    // borderWidth: 1,
                }]
            },
            options: {
                // layout: {
                //     padding: 100
                // }
            }
        });
    }
    valence() {
        return new Chart(document.getElementById('valence-chart'), {
            type: 'doughnut',
            data: {
                labels: dataClient.frequencies.valence.map(d => d.name),
                datasets: [{
                    label: 'Summary of Valence',
                    data: dataClient.frequencies.valence.map(d => Number(d.frequency)),
                    backgroundColor: [Charts.red, Charts.green],
                    // borderColor: ['black'],
                    // borderWidth: 1,
                }]
            }
        });
    }
    basic() {

        return new Chart(document.getElementById('basic-chart'), {
            type: 'bar',
            data: {
                labels: dataClient.frequencies.mood.map(d => d.name),
                datasets: [{
                    label: 'Frequency of mood',
                    data: dataClient.frequencies.mood.map(d => Number(d.frequency)),
                    backgroundColor: dataClient.frequencies.mood.map(d => Number(d.valence) > 0 ? Charts.green : Charts.red),
                    borderWidth: 1,
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    relationship(activity, data) {
        for (const i in Chart.instances) {
            const instance = Chart.instances[i];
            if (instance.canvas.id === 'activity-relationship-chart') {
                instance.destroy();
                break;
            }
        }
    
        const chartData = [];
        for (const i in data) {
            chartData.push(data[i]);
        }
    
        new Chart(document.getElementById('activity-relationship-chart'), {
            type: 'pie',
            data: {
                labels: Object.getOwnPropertyNames(data),
                datasets: [{
                    label: 'Frequency of ' + activity,
                    data: chartData
                }]
            }
        }
        );
    }
}

initialiseCharts();