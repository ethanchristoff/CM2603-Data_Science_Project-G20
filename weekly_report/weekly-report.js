const createChart = (id, type, data, options) => {
    new Chart(document.getElementById(id), {
        type: type,
        data: data,
        options: options
    });
};

// 📊 1. Falls vs Non-Falls Distribution (Bar Chart)
createChart("chart1", "bar", {
    labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    datasets: [
        {
            label: "Falls",
            data: [3, 2, 4, 1, 5, 3, 2],
            backgroundColor: "rgba(255, 99, 132, 0.6)"
        },
        {
            label: "Non-Falls",
            data: [20, 18, 25, 22, 19, 21, 23],
            backgroundColor: "rgba(54, 162, 235, 0.6)"
        }
        ]
}, { responsive: true });

// 📊 2. Average Heart Rates (Line Chart)
createChart("chart2", "line", {
    labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    datasets: [{
        label: "Avg Heart Rate (bpm)",
        data: [72, 75, 74, 70, 73, 71, 76],
        borderColor: "rgba(255, 159, 64, 1)",
        backgroundColor: "rgba(255, 159, 64, 0.2)",
        borderWidth: 2,
        fill: true
    }]
}, { responsive: true });

// 📊 3. Average Blood Pressure (Line Chart)
createChart("chart3", "line", {
    labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    datasets: [
        {
            label: "Systolic (mmHg)",
            data: [120, 118, 121, 122, 119, 117, 123],
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderWidth: 2,
            fill: true
        },
        {
            label: "Diastolic (mmHg)",
            data: [80, 78, 81, 79, 77, 76, 82],
            borderColor: "rgba(153, 102, 255, 1)",
            backgroundColor: "rgba(153, 102, 255, 0.2)",
            borderWidth: 2,
            fill: true
        }
        ]
}, { responsive: true });

// 📊 4. Daily Movement Trend Over the Week (Time Series Line Chart)

createChart("chart4", "line", {
    labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    datasets: [{
        label: "Avg Movement Score",
        data: [200, 250, 230, 270, 260, 240, 280],
        borderColor: "rgba(255, 206, 86, 1)",
        backgroundColor: "rgba(255, 206, 86, 0.2)",
        borderWidth: 2,
        fill: true
    }]
}, { responsive: true });