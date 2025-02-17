// Sidebar Toggle Functionality
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('mainContent');

sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
});



// Chart Data
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const fallsData = {
    labels: days,
    datasets: [
        {
            label: 'Falls',
            data: [2, 1, 3, 0, 2, 1, 0],
            backgroundColor: '#dc3545',
            barPercentage: 0.6,
        },
        {
            label: 'No Falls',
            data: [22, 23, 21, 24, 22, 23, 24],
            backgroundColor: '#198754',
            barPercentage: 0.6,
        }
        ]
};

const heartRateData = {
    labels: days,
    datasets: [{
        label: 'BPM',
        data: [72, 75, 71, 73, 70, 69, 72],
        borderColor: '#0d6efd',
        tension: 0.3,
        fill: false
    }]
};

const movementData = {
    labels: days,
    datasets: [{
        label: 'Movement %',
        data: [65, 72, 58, 69, 62, 45, 51],
        borderColor: '#6f42c1',
        backgroundColor: 'rgba(111, 66, 193, 0.2)',
        tension: 0.3,
        fill: true
    }]
};

// Chart Configuration
const chartConfig = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: {
            beginAtZero: true
        }
    }
};

// Create Charts
new Chart(document.getElementById('fallsChart'), {
    type: 'bar',
    data: fallsData,
    options: chartConfig
});

new Chart(document.getElementById('heartRateChart'), {
    type: 'line',
    data: heartRateData,
    options: chartConfig
});

new Chart(document.getElementById('movementChart'), {
    type: 'line',
    data: movementData,
    options: chartConfig
});