
async function initialiseCharts() {
    document
        .querySelectorAll('.chart-pane-button')
        .forEach(btn => btn.addEventListener('click', handleChartControlClick));
}

async function handleChartControlClick(event) {
    const btnId = event.target.id;
    configureChartPane(btnId);
    switch (btnId) {
        case 'chart-intro': break;
        case 'chart-arousal': Charts.arousal(); break;
        case 'chart-valence': Charts.valence(); break;
        case 'chart-relationships': Charts.relationship(); break;
        case 'chart-summary': Charts.summary(); break;
        case 'chart-mood-freq': 
        default: Charts.moodFrequency();
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
    if (buttonId == 'chart-relationships') {
        chartRelButtons.classList.remove('hidden');
    } else {
        chartRelButtons.classList.add('hidden');
        for (const child of Array.from(chartRelButtons.children)) {
            chartRelButtons.removeChild(child);
        }
    }
}


class Charts {
    static #canvasId = 'current-chart';
    static #red = '#bf212f';
    static #green = '#27b376';
    static async #getChartData(chartType) {
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
            if (response.status == 200) {
                return await response.json();
            } else {
                return [];
            }
    }
    static #destruct() {
        console.dir(Chart.instances);
        for (const i in Chart.instances) {
            const instance = Chart.instances[i];
            if (instance.canvas.id === this.#canvasId) {
                instance.destroy();
                break;
            }
        }
    }
    static async arousal() {
        this.#destruct();
        const data = await this.#getChartData('arousal');
        return new Chart(document.getElementById(this.#canvasId), {
            type: 'pie',
            data: {
                labels: data.map(d => d.name),
                datasets: [{
                    data: data.map(d => Number(d.frequency)),
                    backgroundColor: [this.#green, this.#red],
                }]
            }
        });
    }
    static async valence() {
        this.#destruct();
        const data = await this.#getChartData('valence');
        return new Chart(document.getElementById(this.#canvasId), {
            type: 'pie',
            data: {
                labels: data.map(d => d.name),
                datasets: [{
                    data: data.map(d => Number(d.frequency)),
                    backgroundColor: [this.#red, this.#green],
                }]
            }
        });
    }
    static async moodFrequency() {
        this.#destruct();
        const data = await this.#getChartData('moodFrequency');
        console.dir(data);
        return new Chart(document.getElementById(this.#canvasId), {
            type: 'bar',
            data: {
                labels: data.map(d => d.name),
                datasets: [{
                    label: 'Frequency of mood',
                    data: data.map(d => Number(d.frequency)),
                    backgroundColor: data.map(d => Number(d.valence) > 0 ? this.#green : this.#red),
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
    static async summary() {
        this.#destruct();
        const data = await this.#getChartData('summary');
        console.dir(data);
        return new Chart(document.getElementById(this.#canvasId), {
            type: 'line',
            data: {
                labels: data.map(d => '(' + new Date(d.thedate).toDateString() + ') ' + d.mood),
                datasets: [{
                    label: 'Frequency of most common mood per day',
                    data: data.map(d => Number(d.freq)),
                    backgroundColor: data.map(d => d.valence == 'Positive' ? this.#green : this.#red),
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
        this.#destruct();

        // get data
        const data = await this.#getChartData('relationship');

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
        new Chart(document.getElementById(this.#canvasId), {
            type: 'bar',
            data: {
                labels: frequencySortedData.map(d => d.activity + '/ ' + d.mood),
                datasets: [{
                    label: 'Combination frequency',
                    data: frequencySortedData.map(d => d.frequency),
                    backgroundColor: frequencySortedData.map(d => d.valence.toLowerCase() == 'negative' ? this.#red : this.#green)
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Activity/ Mood Combinations'
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
        this.#destruct();

        // prepare buttons

        const frequencySortedData = Array.from(data).sort((a, b) => b.frequency - a.frequency);
        const activitySortedData = Array.from(data).sort((a, b) => a.activity == b.activity ? 0 : (a.activity > b.activity ? -1 : 1));
        console.log('-=-=-=-=-=-=-=-=-=-=-=-=-');
        console.log(activitySortedData);
        console.log('-=-=-=-=-=-=-=-=-=-=-=-=-');
          
        new Chart(document.getElementById(this.#canvasId), {
            type: 'bar',
            data: {
                labels: frequencySortedData.map(d => d.mood),
                datasets: [{
                    label: 'Mood frequency when doing: ' + data[0].activity,
                    data: frequencySortedData.map(d => d.frequency),
                    backgroundColor: frequencySortedData.map(d => d.valence.toLowerCase() == 'negative' ? this.#red : this.#green)
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
}

initialiseCharts();