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

(function initialiseCharts() {
    const basic = basicChart();
    const valence = valenceChart();
    const arousal = arousalChart();
    // console.log(Object.getOwnPropertyNames(arousal));
    // console.log(arousal.config);

})();


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