// Global variables for charts and data
let heartRateChart, spo2Chart, motionChart;
let heartRateData = [];
let spo2Data = [];
let movementData = [];
let fallStatus = 0; // 0 = safe, 1 = at risk, 2 = fall detected
const MAX_DATA_POINTS = 30;
let socket = null;

// Initialize WebSocket connection
function initWebSocket() {
    // Use secure WebSocket if the page is served over HTTPS
    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const wsUrl = protocol + window.location.host + '/ws/sensor_data/';

    // Close existing socket if one exists
    if (socket) {
        socket.close();
    }

    socket = new WebSocket(wsUrl);

    socket.onopen = function (e) {
        console.log('WebSocket connection established');
        // Update connection status
        const connectionStatus = document.getElementById('connectionStatus');
        if (connectionStatus) {
            connectionStatus.className = 'badge bg-success';
            connectionStatus.textContent = 'Connected';
        }
    };

    socket.onmessage = function (e) {
        try {
            const data = JSON.parse(e.data);
            updateDashboard(data);
        } catch (error) {
            console.error('Error processing WebSocket message:', error);
        }
    };

    socket.onclose = function (e) {
        console.log('WebSocket connection closed');
        // Update connection status
        const connectionStatus = document.getElementById('connectionStatus');
        if (connectionStatus) {
            connectionStatus.className = 'badge bg-danger';
            connectionStatus.textContent = 'Disconnected';
        }

        // Try to reconnect after 3 seconds
        setTimeout(initWebSocket, 3000);
    };

    socket.onerror = function (e) {
        console.error('WebSocket error:', e);
        socket.close();
    };
}

// Update dashboard with real-time data from WebSocket
function updateDashboard(data) {
    // Update fall status
    if (data.fall_detected !== undefined) {
        updateFallStatus(data.fall_detected ? 2 : 0);
    }

    // Update heart rate
    if (data.heart_rate !== undefined) {
        updateHeartRate(data.heart_rate);
    }

    // Update SpO2
    if (data.spo2 !== undefined) {
        updateSpO2(data.spo2);
    }

    // Update movement level
    if (data.movement_level !== undefined) {
        updateMovementLevel(data.movement_level);
    }

    // Update last check-in time if available
    const lastCheckInElement = document.getElementById('lastCheckIn');
    if (lastCheckInElement && data.last_check_in !== undefined) {
        lastCheckInElement.textContent = data.last_check_in;
    }
}

// Update heart rate display and chart
function updateHeartRate(value) {
    // Update display value
    const heartRateValueElement = document.getElementById('heartRateValue');
    if (heartRateValueElement) {
        heartRateValueElement.textContent = value;
    }

    // Add new data point to chart
    heartRateData.push(value);
    if (heartRateData.length > MAX_DATA_POINTS) {
        heartRateData.shift();
    }

    // Update chart if it exists
    if (heartRateChart) {
        heartRateChart.data.datasets[0].data = heartRateData;
        heartRateChart.update('none');
    }

    // Update status
    const heartRateStatus = document.getElementById('heartRateStatus');
    if (heartRateStatus) {
        if (value < 60) {
            heartRateStatus.className = 'badge bg-warning text-dark';
            heartRateStatus.textContent = 'Low';
        } else if (value > 100) {
            heartRateStatus.className = 'badge bg-warning text-dark';
            heartRateStatus.textContent = 'Elevated';
        } else {
            heartRateStatus.className = 'badge bg-success';
            heartRateStatus.textContent = 'Normal';
        }
    }
}

// Update SpO2 display and chart
function updateSpO2(value) {
    // Update display value
    const spo2ValueElement = document.getElementById('spo2Value');
    if (spo2ValueElement) {
        spo2ValueElement.textContent = value;
    }

    // Add new data point to chart
    spo2Data.push(value);
    if (spo2Data.length > MAX_DATA_POINTS) {
        spo2Data.shift();
    }

    // Update chart if it exists
    if (spo2Chart) {
        spo2Chart.data.datasets[0].data = spo2Data;
        spo2Chart.update('none');
    }

    // Update status
    const spo2Status = document.getElementById('spo2Status');
    if (spo2Status) {
        if (value < 95) {
            spo2Status.className = 'badge bg-warning text-dark';
            spo2Status.textContent = 'Low';
        } else {
            spo2Status.className = 'badge bg-success';
            spo2Status.textContent = 'Normal';
        }
    }
}

// Update movement level display and chart
function updateMovementLevel(value) {
    // Add new data point to chart
    movementData.push(value);
    if (movementData.length > MAX_DATA_POINTS) {
        movementData.shift();
    }

    // Update chart if it exists
    if (motionChart) {
        motionChart.data.datasets[0].data = movementData;
        motionChart.update('none');
    }

    // Update movement status based on value
    const motionStatus = document.getElementById('motionStatus');
    if (motionStatus) {
        if (fallStatus === 2) {
            motionStatus.className = 'badge bg-danger';
            motionStatus.textContent = 'Fall Detected';
        } else if (fallStatus === 1) {
            motionStatus.className = 'badge bg-warning text-dark';
            motionStatus.textContent = 'Unsteady Movement';
        } else if (value > 70) {
            motionStatus.className = 'badge bg-info';
            motionStatus.textContent = 'High Activity';
        } else if (value > 40) {
            motionStatus.className = 'badge bg-success';
            motionStatus.textContent = 'Normal Activity';
        } else if (value > 15) {
            motionStatus.className = 'badge bg-secondary';
            motionStatus.textContent = 'Low Activity';
        } else {
            motionStatus.className = 'badge bg-warning text-dark';
            motionStatus.textContent = 'Very Low Activity';
        }
    }
}

// Update fall status and related UI elements
function updateFallStatus(status) {
    fallStatus = status;

    const fallAlert = document.getElementById('fallAlert');
    const riskLevel = document.getElementById('riskLevel');
    const riskStatus = document.getElementById('riskStatus');
    const riskProgress = document.getElementById('riskProgress');
    const motionStatus = document.getElementById('motionStatus');

    // Optional elements that might not exist in all versions of the UI
    const cameraOutput = document.getElementById('cameraOutput');
    const cameraStatus = document.getElementById('cameraStatus');

    if (status === 0) {
        // Safe - No fall detected
        if (fallAlert) {
            fallAlert.className = 'alert alert-safe p-3 text-center fw-bold';
            fallAlert.innerHTML = '<i class="bi bi-shield-check me-2"></i> Client Status: Normal - No Fall Detected';
        }

        if (cameraOutput) cameraOutput.textContent = 'No Fall';
        if (cameraStatus) {
            cameraStatus.className = 'badge bg-success';
            cameraStatus.textContent = 'Safe';
        }

        if (riskLevel) riskLevel.textContent = 'Low';
        if (riskStatus) {
            riskStatus.className = 'badge bg-success';
            riskStatus.textContent = 'Safe';
        }

        if (riskProgress) {
            riskProgress.className = 'progress-bar bg-success';
            riskProgress.style.width = '15%';
            riskProgress.textContent = '15%';
        }

        if (motionStatus) {
            motionStatus.className = 'badge bg-success';
            motionStatus.textContent = 'Normal Activity';
        }
    } else if (status === 1) {
        // At risk of falling
        if (fallAlert) {
            fallAlert.className = 'alert alert-risk p-3 text-center fw-bold';
            fallAlert.innerHTML = '<i class="bi bi-exclamation-triangle me-2"></i> Client Status: CAUTION - Fall Risk Detected';
        }

        if (cameraOutput) cameraOutput.textContent = 'At Risk';
        if (cameraStatus) {
            cameraStatus.className = 'badge bg-warning text-dark';
            cameraStatus.textContent = 'Caution';
        }

        if (riskLevel) riskLevel.textContent = 'Moderate';
        if (riskStatus) {
            riskStatus.className = 'badge bg-warning text-dark';
            riskStatus.textContent = 'Caution';
        }

        if (riskProgress) {
            riskProgress.className = 'progress-bar bg-warning';
            riskProgress.style.width = '50%';
            riskProgress.textContent = '50%';
        }

        if (motionStatus) {
            motionStatus.className = 'badge bg-warning text-dark';
            motionStatus.textContent = 'Unsteady Movement';
        }
    } else {
        // Fall detected
        if (fallAlert) {
            fallAlert.className = 'alert alert-fall p-3 text-center fw-bold';
            fallAlert.innerHTML = '<i class="bi bi-exclamation-circle me-2"></i> ALERT: FALL DETECTED! IMMEDIATE ATTENTION REQUIRED';
        }

        if (cameraOutput) cameraOutput.textContent = 'FALL';
        if (cameraStatus) {
            cameraStatus.className = 'badge bg-danger';
            cameraStatus.textContent = 'Emergency';
        }

        if (riskLevel) riskLevel.textContent = 'High';
        if (riskStatus) {
            riskStatus.className = 'badge bg-danger';
            riskStatus.textContent = 'Emergency';
        }

        if (riskProgress) {
            riskProgress.className = 'progress-bar bg-danger';
            riskProgress.style.width = '90%';
            riskProgress.textContent = '90%';
        }

        if (motionStatus) {
            motionStatus.className = 'badge bg-danger';
            motionStatus.textContent = 'Fall Detected';
        }
    }
}

// Initialize charts
function initializeCharts() {
    try {
        // Heart Rate Chart
        const heartRateCtx = document.getElementById('heartRateChart');
        if (heartRateCtx) {
            heartRateData = Array(MAX_DATA_POINTS).fill(72);

            const heartRateChartData = {
                labels: Array(MAX_DATA_POINTS).fill(''),
                datasets: [{
                    label: 'Heart Rate (bpm)',
                    data: heartRateData,
                    borderColor: '#2c5282',
                    backgroundColor: 'rgba(44, 82, 130, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4,
                    fill: true
                }]
            };

            heartRateChart = new Chart(heartRateCtx, {
                type: 'line',
                data: heartRateChartData,
                options: {
                    scales: {
                        y: {
                            min: 40,
                            max: 120,
                            ticks: {
                                stepSize: 20
                            }
                        },
                        x: {
                            display: false
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    maintainAspectRatio: false,
                    animation: {
                        duration: 0
                    }
                }
            });
        }

        // SpO2 Chart
        const spo2Ctx = document.getElementById('spo2Chart');
        if (spo2Ctx) {
            spo2Data = Array(MAX_DATA_POINTS).fill(98);

            const spo2ChartData = {
                labels: Array(MAX_DATA_POINTS).fill(''),
                datasets: [{
                    label: 'SpO2 (%)',
                    data: spo2Data,
                    borderColor: '#3182ce',
                    backgroundColor: 'rgba(49, 130, 206, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4,
                    fill: true
                }]
            };

            spo2Chart = new Chart(spo2Ctx, {
                type: 'line',
                data: spo2ChartData,
                options: {
                    scales: {
                        y: {
                            min: 90,
                            max: 100,
                            ticks: {
                                stepSize: 2
                            }
                        },
                        x: {
                            display: false
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    maintainAspectRatio: false,
                    animation: {
                        duration: 0
                    }
                }
            });
        }

        // Movement Chart
        const motionCtx = document.getElementById('motionChart');
        if (motionCtx) {
            movementData = Array(MAX_DATA_POINTS).fill(50);

            const motionChartData = {
                labels: Array(MAX_DATA_POINTS).fill(''),
                datasets: [{
                    label: 'Movement Level',
                    data: movementData,
                    borderColor: '#3182ce',
                    backgroundColor: 'rgba(49, 130, 206, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4,
                    fill: true
                }]
            };

            motionChart = new Chart(motionCtx, {
                type: 'line',
                data: motionChartData,
                options: {
                    scales: {
                        y: {
                            min: 0,
                            max: 100,
                            ticks: {
                                stepSize: 25
                            }
                        },
                        x: {
                            display: false
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    maintainAspectRatio: false,
                    animation: {
                        duration: 0
                    }
                }
            });
        }

        return {
            heartRateChart,
            spo2Chart,
            motionChart
        };
    } catch (error) {
        console.error('Error initializing charts:', error);
        return {};
    }
}

// Function to start simulating data (for testing when WebSocket is not available)
function startSimulation() {
    console.log('Starting data simulation mode');

    // Simulate heart rate data
    setInterval(() => {
        if (!heartRateChart) return;

        const lastData = heartRateChart.data.datasets[0].data;
        const lastValue = lastData[lastData.length - 1];
        const newValue = Math.max(50, Math.min(110, lastValue + (Math.random() * 6 - 3)));

        updateHeartRate(Math.round(newValue));
    }, 1000);

    // Simulate SpO2 data
    setInterval(() => {
        if (!spo2Chart) return;

        const lastData = spo2Chart.data.datasets[0].data;
        const lastValue = lastData[lastData.length - 1];
        const newValue = Math.max(94, Math.min(100, lastValue + (Math.random() * 0.6 - 0.3)));

        updateSpO2(Math.round(newValue));
    }, 1500);

    // Simulate movement data
    setInterval(() => {
        if (!motionChart) return;

        const lastData = motionChart.data.datasets[0].data;
        const lastValue = lastData[lastData.length - 1];

        let newValue;

        // Simulate movement based on current fall status
        if (fallStatus === 1) {
            // At risk - increase variability and level
            newValue = Math.max(30, Math.min(90, lastValue + (Math.random() * 20 - 5)));
        } else if (fallStatus === 2) {
            // Fall detected - dramatic spike then drop
            if (Math.random() > 0.5) {
                newValue = Math.max(80, Math.min(100, 90 + Math.random() * 10)); // Spike
            } else {
                newValue = Math.max(0, Math.min(20, 10 + Math.random() * 10)); // Drop after fall
            }
        } else {
            // Normal movement
            newValue = Math.max(5, Math.min(95, lastValue + (Math.random() * 10 - 5)));
        }

        updateMovementLevel(Math.round(newValue));
    }, 1000);

    // Randomly toggle fall status for demonstration
    setInterval(() => {
        const rand = Math.random();
        if (rand > 0.95) { // 5% chance of fall
            updateFallStatus(2);
            // Reset after 10 seconds
            setTimeout(() => updateFallStatus(0), 10000);
        } else if (rand > 0.85) { // 10% chance of risk
            updateFallStatus(1);
            // Reset after 15 seconds
            setTimeout(() => updateFallStatus(0), 15000);
        }
    }, 30000);
}

// Handle sidebar toggle
function initializeSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');

    if (sidebarToggle && sidebar && mainContent) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
        });
    }
}

// Check WebSocket connection status
function checkWebSocketConnection() {
    return socket && socket.readyState === WebSocket.OPEN;
}

// Main initialization function
function initializeApp() {
    // Initialize UI components
    initializeSidebar();

    // Initialize charts
    const charts = initializeCharts();

    // Set initial fall status
    updateFallStatus(0);

    // Try to connect to WebSocket
    try {
        initWebSocket();

        // If WebSocket connection fails or is not available, start simulation after 5 seconds
        setTimeout(() => {
            if (!checkWebSocketConnection()) {
                console.log('WebSocket connection not available. Starting simulation mode.');
                startSimulation();
            }
        }, 5000);
    } catch (error) {
        console.error('Error initializing WebSocket:', error);
        // Fall back to simulation mode
        startSimulation();
    }
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', initializeApp);