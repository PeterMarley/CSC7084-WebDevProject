
async function initialiseCharts() {
    document
        .querySelectorAll('.chart-pane-button')
        .forEach(e => e.addEventListener('click', handleChartControlClick));

    const cookieName = 'token=';
    const token = document.cookie
        .split(';')
        .find(cookie => cookie.trim().startsWith(cookieName))
        .substring(cookieName.length + 1);

    const response = await fetch(
        '/api/visualize/moodFrequency',
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            }
        });
    const json = await response.json();

    console.dir(json);
    // controls.intro;
    // controls.moodFreq.addEventListener('click', handleChartControlClick);
    // controls.arousal.addEventListener('click', handleChartControlClick);
    // controls.valence.addEventListener('click', handleChartControlClick);
    // controls.relationships.addEventListener('click', handleChartControlClick);
    // controls.summary.addEventListener('click', handleChartControlClick);
}

function handleChartControlClick(event) {
    Charts.destruct();
    const btnId = event.target.id;
    configureChartPane(btnId);
    switch (btnId) {
        case 'chart-intro': break;
        case 'chart-mood-freq': Charts.moodFrequency(); break;
        case 'chart-arousal': Charts.arousal(); break;
        case 'chart-valence': Charts.valence(); break;
        case 'chart-relationships': Charts.relationship(); break;
        case 'chart-summary': Charts.summary(); break;
        default:
    }
}

function configureChartPane(buttonId) {
    if (buttonId === 'chart-intro') {
        document.querySelector('#chart-intro-text').classList.remove('hidden');
        document.querySelector('#current-chart').classList.add('hidden');
    } else {
        document.querySelector('#chart-intro-text').classList.add('hidden');
        document.querySelector('#current-chart').classList.remove('hidden');
    }

    const buttons = document.querySelectorAll('.chart-pane-button');
    for (const button of buttons) {
        button.classList.remove('selected');
    }

    document.querySelector('#' + buttonId).classList.add('selected');
}

function initialiseChartsOld() {
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
    // const valence = charts.valence();
    // const arousal = charts.arousal();

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

{/* <div class="chart-container">
  <div class="charts">
    <canvas id="current-chart" class="chart-canvas"></canvas>
    <canvas id="valence-chart" class="chart-canvas"></canvas>
    <canvas id="arousal-chart" class="chart-canvas"></canvas>
    <div id="relationship-buttons-container"></div>
    <canvas id="activity-relationship-chart" class="chart-canvas"></canvas>
  </div>
</div> */}

class Charts {
    static selector = 'current-chart';
    static red = '#bf212f';
    static green = '#27b376';
    static destruct() {
        for (const i in Chart.instances) {
            const instance = Chart.instances[i];
            if (instance.canvas.id === Charts.selector) {
                instance.destroy();
                break;
            }
        }
    }
    static arousal() {
        return new Chart(document.getElementById(Charts.selector), {
            type: 'pie',
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
    static valence() {
        return new Chart(document.getElementById(Charts.selector), {
            type: 'pie',
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
    static moodFrequency() {
        this.destruct();
        return new Chart(document.getElementById(Charts.selector), {
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
    static relationship(activity, data) {
        this.destruct();
        const chartData = [];
        for (const i in data) {
            chartData.push(data[i]);
        }

        new Chart(document.getElementById(Charts.selector), {
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
    static summary() {
        throw new Error('summary chart not implemented');
    }
}

initialiseCharts();