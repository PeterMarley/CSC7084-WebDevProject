// (function initialiseCharts() {
//     basicChart();
//     valenceChart();
// })();

// function valenceChart() {
//     const valenceChart = new Chart(document.getElementById('valence-chart'), {
//         type: 'pie',
//         data: {
//             labels: dataClient.frequencies.valence.map(d => d.name),
//             datasets: [{
//                 label: 'Summary of Valence',
//                 data: dataClient.frequencies.valence.map(d => Number(d.frequency)),
//                 backgroundColor: ['red', 'green'],
//                 borderColor: ['black'],
//                 borderWidth: 1,
//             }]
//         },
//         options: {
//             scales: {
//                 y: {
//                     beginAtZero: true
//                 }
//             }
//         }
//     });
// }

// function basicChart() {
//     const basicChart = new Chart(document.getElementById('basic-chart'), {
//         type: 'bar',
//         data: {
//             labels: dataClient.frequencies.mood.map(d => d.name),
//             datasets: [{
//                 label: 'Frequency of mood',
//                 data: dataClient.frequencies.mood.map(d => Number(d.frequency)),
//                 backgroundColor: ['azure'],
//                 borderColor: ['black'],
//                 borderWidth: 1,
//             }]
//         },
//         options: {
//             scales: {
//                 y: {
//                     beginAtZero: true
//                 }
//             }
//         }
//     });
// }

const moods = [];
const activities = [];
const map = new Map();

(function initialiseCharts() {

    processData();
    console.log(map);
    const basic = basicChart();
    const valence = valenceChart();
    const arousal = arousalChart();
    // const relationships = activityRelationShipsChartFirstAttemp();
    const relationships2 = activityRelationShipsChartSecondAttemp();

    const relationshipButtons = document.querySelector('#relationship-buttons');
    for (const record of map) {
        const [key, val] = record;
        const e = document.createElement('span');

        e.textContent = key;
        e.style.border = "1px solid red";
        e.style.padding = "10px";
        e.addEventListener('click', () => showRelationShipChart(key, val));
        relationshipButtons.appendChild(e);
        // console.log(key);
        // console.log(val);
    }

    console.log('-=-=-=-=-=-=-=-');
    console.log(Chart.instances);
    console.log('-=-=-=-=-=-=-=-');
    // console.log(Object.getOwnPropertyNames(arousal));
    // console.log(arousal.config);

})();

function showRelationShipChart(activity, data) {
    /*
    <div class="chart-container">
    <canvas id="basic-chart" class="chart-canvas"></canvas>
    <canvas id="valence-chart" class="chart-canvas"></canvas>
    <canvas id="arousal-chart" class="chart-canvas"></canvas>
    <div id="relationship-buttons"></div>
    <canvas id="activity-relationship-chart" class="chart-canvas"></canvas>
    </div>
    */
    const instances = Object.getOwnPropertyNames(Chart.instances);
    for (const instance of instances) {
        const currentInstance = Chart.instances[instance];
        // console.log(currentInstance.canvas.id);
        if (currentInstance.canvas.id === 'activity-relationship-chart') {
            currentInstance.destroy();
            break;
        }
    }
    console.log('\t data');
    console.log(data);
    const meDarta = [];
    for (const x in data) {
        meDarta.push(data[x]);
    }
    console.log('\t meDarta');
    console.log(meDarta);
    // a.find(c => c.canvas.id === 'activity-relationship-chart').destroy();
    // const labels = Object.getOwnPropertyNames(data);
    new Chart(document.getElementById('activity-relationship-chart'), {
        type: 'polarArea',
        data: {
            labels : Object.getOwnPropertyNames(data),
            datasets: [{
                label: 'Frequency of ' + activity,
                data: meDarta
            }]
        }
    }
    );
}

function processData() {
    dataClient.relationships.activityMoodRelationships.forEach(e => {
        if (moods.findIndex(m => m === e.mood) === -1) {
            moods.push(e.mood);
        }
        if (activities.findIndex(a => a === e.activity) === -1) {
            activities.push(e.activity);
        }
    });

    dataClient.relationships.activityMoodRelationships.forEach(element => {
        const valueFromMap = map.get(element.activity);
        if (!valueFromMap) {
            const thing = {};
            // console.log('=== inner loop start ===');
            dataClient.relationships.activityMoodRelationships.forEach(e => {

                // console.log(e.activity);
                // console.log(Object.hasOwnProperty(e.mood));
                if (e.activity === element.activity && !Object.hasOwnProperty(e.mood)) {
                    thing[e.mood] = e.frequency
                    // console.log(thing[e.mood]);
                }
            });
            // console.log('=== inner loop end ===');

            map.set(element.activity, thing);
        }
    });
}

function activityRelationShipsChartSecondAttemp() {

}
function activityRelationShipsChartFirstAttemp() {
    const moods = [];
    const activities = [];
    dataClient.relationships.activityMoodRelationships.forEach(e => {
        if (moods.findIndex(m => m === e.mood) === -1) {
            moods.push(e.mood);
        }
        if (activities.findIndex(a => a === e.activity) === -1) {
            activities.push(e.activity);
        }
    });
    console.log(moods);
    console.log(activities);
    return new Chart(document.getElementById('activity-relationship-chart'), {
        type: 'bar',
        data: {
            labels: dataClient.relationships.activityMoodRelationships.map(d => d.activity),
            datasets: [{
                label: 'Frequency of activities',
                data: dataClient.relationships.activityMoodRelationships.map(d => d.frequency)
            }]
        }
    }
    );

    // const moods = [];
    // const activities = [];
    // dataClient.relationships.forEach(e => {
    //     if (moods.findIndex(m => m === e.mood) === -1) {
    //         moods.push(e.mood);
    //     }
    //     if (activities.findIndex(a => a === e.activity) === -1) {
    //         activities.push(e.activity);
    //     }
    // });
    // console.log(moods);
    // console.log(activities);
    // return new Chart(document.getElementById('activity-relationship-chart'), {
    //     type: 'bar',
    //     data: {
    //         labels: dataClient.relationships.map(d => d.activity),
    //         datasets: [{
    //             label: 'Frequency of activities',
    //             data: dataClient.relationships.map(d => d.frequency)
    //         }]
    //     }
    // }
    // );
}

//FIXME how to get bloody colours working?
function arousalChart() {
    return new Chart(document.getElementById('arousal-chart'), {
        type: 'doughnut',
        data: {
            labels: dataClient.frequencies.arousal.map(d => d.name),
            datasets: [{
                label: 'Summary of Arousal',
                data: dataClient.frequencies.arousal.map(d => Number(d.frequency)),
                backgroundColor: ['red', 'green'],
                borderColor: ['black'],
                borderWidth: 1,
            }]
        },
        options: {
            // layout: {
            //     padding: 100
            // }
        }
    });
}

function valenceChart() {
    return new Chart(document.getElementById('valence-chart'), {
        type: 'doughnut',
        data: {
            labels: dataClient.frequencies.valence.map(d => d.name),
            datasets: [{
                label: 'Summary of Valence',
                data: dataClient.frequencies.valence.map(d => Number(d.frequency)),
                backgroundColor: ['red', 'green'],
                borderColor: ['black'],
                borderWidth: 1,
            }]
        }
    });
}

function basicChart() {
    return new Chart(document.getElementById('basic-chart'), {
        type: 'bar',
        data: {
            labels: dataClient.frequencies.mood.map(d => d.name),
            datasets: [{
                label: 'Frequency of mood',
                data: dataClient.frequencies.mood.map(d => Number(d.frequency)),
                backgroundColor: ['azure'],
                borderColor: ['black'],
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