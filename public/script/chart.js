
async function initialiseCharts() {
    document
        .querySelectorAll('.chart-pane-button')
        .forEach(e => e.addEventListener('click', handleChartControlClick));
}

async function getChart(chartType) {
    const cookieName = 'token=';
    const token = document.cookie
        .split(';')
        .find(cookie => cookie.trim().startsWith(cookieName))
        .trim()
        .substring(cookieName.length);
    const response = await fetch(
        '/api/visualize/' + chartType,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            }
        });
    return await response.json();
}

async function handleChartControlClick(event) {
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

    const chartRelButtons = document.querySelector('#relationship-buttons-container');
    console.log(chartRelButtons);
    if (buttonId == 'chart-relationships') {
        chartRelButtons.classList.remove('hidden');
    } else {
        chartRelButtons.classList.add('hidden');
        for (const child of Array.from(chartRelButtons.children)) {
            chartRelButtons.removeChild(child);
        }
    }
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
    static async arousal() {
        this.destruct();
        const data = await getChart('arousal');
        return new Chart(document.getElementById(Charts.selector), {
            type: 'pie',
            data: {
                labels: data.map(d => d.name),
                datasets: [{
                    data: data.map(d => Number(d.frequency)),
                    backgroundColor: [Charts.green, Charts.red],
                }]
            }
        });
    }
    static async valence() {
        this.destruct();
        const data = await getChart('valence');
        return new Chart(document.getElementById(Charts.selector), {
            type: 'pie',
            data: {
                labels: data.map(d => d.name),
                datasets: [{
                    data: data.map(d => Number(d.frequency)),
                    backgroundColor: [Charts.red, Charts.green],
                }]
            }
        });
    }
    static async moodFrequency() {
        this.destruct();
        const data = await getChart('moodFrequency');
        console.dir(data);
        return new Chart(document.getElementById(Charts.selector), {
            type: 'bar',
            data: {
                labels: data.map(d => d.name),
                datasets: [{
                    label: 'Frequency of mood',
                    data: data.map(d => Number(d.frequency)),
                    backgroundColor: data.map(d => Number(d.valence) > 0 ? Charts.green : Charts.red),
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
    static async relationship() {
        // destroy old chart
        this.destruct();

        // get data
        const data = await getChart('relationship');
        console.log('-=-=-=-=-=-=-=-=-=-=-=-=-');
        console.dir(data);
        console.log('-=-=-=-=-=-=-=-=-=-=-=-=-');
        // prepare buttons
        const buttonContainers = document.querySelector('#relationship-buttons-container');
        
        const frequencySortedData = Array.from(data).sort((a, b) => b.frequency - a.frequency);
        const activitySortedData = Array.from(data).sort((a, b) => {
            if (a.activity > b.activity) { return 1; }
            else if (a.activity > b.activity) {
                return -1;
            } else {
                return 0;
            }
        });
        const uniqueActivities = [...new Set(activitySortedData.map(d => d.activity))];
        
        for (const act of uniqueActivities) {
            // console.groupCollapsed(act);
            const btn = document.createElement('button');
            btn.textContent = act;
            btn.classList.add('button-style-1');
            const newData = frequencySortedData.filter(d => d.activity.toLowerCase() == act.toLowerCase());
            btn.addEventListener('click', () => Charts.relationshipSingle(newData));
            buttonContainers.appendChild(btn);
            // console.groupEnd(act);
        }
        new Chart(document.getElementById(Charts.selector), {
            type: 'bar',
            data: {
                labels: frequencySortedData.map(d => d.valence),
                datasets: [{
                    // label: 'Frequency of ' + activity,
                    data: frequencySortedData.map(d => d.frequency),
                    backgroundColor: frequencySortedData.map(d => d.valence.toLowerCase() == 'negative' ? this.red : this.green)
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'whatever'
                    },
                    legend: {
                        display: false
                    }
                }
            }
        }
        );
    }
    static async relationshipSingle(data) {
        // destroy old chart
        this.destruct();

        // prepare buttons
        
        const frequencySortedData = Array.from(data).sort((a, b) => b.frequency - a.frequency);
        const activitySortedData = Array.from(data).sort((a, b) => {
            if (a.activity > b.activity) { return 1; }
            else if (a.activity > b.activity) {
                return -1;
            } else {
                return 0;
            }
        });
        new Chart(document.getElementById(Charts.selector), {
            type: 'bar',
            data: {
                labels: frequencySortedData.map(d => d.mood),
                datasets: [{
                    // label: 'Frequency of ' + activity,
                    data: frequencySortedData.map(d => d.frequency),
                    // backgroundColor: (cur) => {
                    //     console.log(cur);
                    //     if (cur.valence.toLowerCase() === 'negative') {
                    //         return this.red;
                    //     }
                    //     return this.green;
                    // }
                    backgroundColor: frequencySortedData.map(d => d.valence.toLowerCase() == 'negative' ? this.red : this.green)
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: data[0].activity
                    },
                    legend: {
                        display: false
                    }
                }
            }
        }
        );
    }
    static summary() {
        throw new Error('summary chart not implemented');
    }
}

initialiseCharts();