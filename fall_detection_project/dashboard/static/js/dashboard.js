// Global variables for charts and data
let heartRateChart, spo2Chart, motionChart;
let heartRateData = [];
let spo2Data = [];
let movementData = [];
let fallStatus = 0; // 0 = safe, 1 = at risk, 2 = fall detected
const MAX_DATA_POINTS = 30;
let fallDetectionChart;
let fallDetectionData = [];
let lastFallTime = null;

// Update dashboard with simulated data
function updateDashboard(data) {
  // Update fall status
  if (data.fall_detected !== undefined) {
    const wasDetected = fallStatus === 2;
    const isDetected = data.fall_detected;

    updateFallStatus(isDetected);

    // Record fall event in fall history chart if this is a new fall
    if (!wasDetected && isDetected === 2) {
      recordFallEvent(2); // Fall
    } else if (isDetected === 1) {
      recordFallEvent(1); // Risk
    } else {
      recordFallEvent(0); // No fall
    }
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
  const lastCheckInElement = document.getElementById("lastCheckIn");
  if (lastCheckInElement) {
    lastCheckInElement.textContent = formatDateTime(new Date());
  }
}

// Record a fall event in the fall detection history chart
function recordFallEvent(status) {
  // Only record if we have a chart
  if (!fallDetectionChart) return;

  // Update the data point to status value (0=no fall, 1=risk, 2=fall)
  fallDetectionData.push(status);
  if (fallDetectionData.length > MAX_DATA_POINTS) {
    fallDetectionData.shift();
  }

  // Update the chart
  fallDetectionChart.data.datasets[0].data = fallDetectionData;
  fallDetectionChart.update("none");

  // Update the fall detection status
  const fallDetectionStatus = document.getElementById("fallDetectionStatus");
  if (fallDetectionStatus) {
    if (status === 2) {
      fallDetectionStatus.className = "badge bg-danger";
      fallDetectionStatus.textContent = "Fall Detected";
      // Store the current time as the last fall time
      lastFallTime = new Date();
    } else if (status === 1) {
      fallDetectionStatus.className = "badge bg-warning text-dark";
      fallDetectionStatus.textContent = "Fall Risk";
    } else {
      fallDetectionStatus.className = "badge bg-success";
      fallDetectionStatus.textContent = "No Fall";
    }
  }

  // Update timestamp display if it exists and it's a fall
  if (status === 2) {
    const lastFallTimeElement = document.getElementById("lastFallTime");
    if (lastFallTimeElement) {
      lastFallTimeElement.textContent = formatDateTime(lastFallTime);
    }
  }
}

// Format date time for display
function formatDateTime(date) {
  if (!date) return "Never";

  const options = {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };

  return date.toLocaleString('en-US', options);
}

// Update heart rate display and chart
function updateHeartRate(value) {
  // Update display value
  const heartRateValueElement = document.getElementById("heartRateValue");
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
    heartRateChart.update("none");
  }

  // Update status
  const heartRateStatus = document.getElementById("heartRateStatus");
  if (heartRateStatus) {
    if (value < 60) {
      heartRateStatus.className = "badge bg-warning text-dark";
      heartRateStatus.textContent = "Low";
    } else if (value > 100) {
      heartRateStatus.className = "badge bg-warning text-dark";
      heartRateStatus.textContent = "Elevated";
    } else {
      heartRateStatus.className = "badge bg-success";
      heartRateStatus.textContent = "Normal";
    }
  }
}

// Update SpO2 display and chart
function updateSpO2(value) {
  // Update display value
  const spo2ValueElement = document.getElementById("spo2Value");
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
    spo2Chart.update("none");
  }

  // Update status
  const spo2Status = document.getElementById("spo2Status");
  if (spo2Status) {
    if (value < 95) {
      spo2Status.className = "badge bg-warning text-dark";
      spo2Status.textContent = "Low";
    } else {
      spo2Status.className = "badge bg-success";
      spo2Status.textContent = "Normal";
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
    motionChart.update("none");
  }

  // Update movement status based on value - adjusted for 0-10 scale
  const motionStatus = document.getElementById("motionStatus");
  if (motionStatus) {
    if (fallStatus === 2) {
      motionStatus.className = "badge bg-danger";
      motionStatus.textContent = "Fall Detected";
    } else if (fallStatus === 1) {
      motionStatus.className = "badge bg-warning text-dark";
      motionStatus.textContent = "Unsteady Movement";
    } else if (value > 7) {
      motionStatus.className = "badge bg-info";
      motionStatus.textContent = "High Activity";
    } else if (value > 4) {
      motionStatus.className = "badge bg-success";
      motionStatus.textContent = "Normal Activity";
    } else if (value > 1.5) {
      motionStatus.className = "badge bg-secondary";
      motionStatus.textContent = "Low Activity";
    } else {
      motionStatus.className = "badge bg-warning text-dark";
      motionStatus.textContent = "Very Low Activity";
    }
  }
}

// Update fall status and related UI elements
function updateFallStatus(status) {
  const previousStatus = fallStatus;
  fallStatus = status;

  const fallAlert = document.getElementById("fallAlert");
  const riskLevel = document.getElementById("riskLevel");
  const riskStatus = document.getElementById("riskStatus");
  const riskProgress = document.getElementById("riskProgress");
  const motionStatus = document.getElementById("motionStatus");
  const fallDetectionStatus = document.getElementById("fallDetectionStatus");

  // Optional elements that might not exist in all versions of the UI
  const cameraOutput = document.getElementById("cameraOutput");
  const cameraStatus = document.getElementById("cameraStatus");

  if (status === 0) {
    // Safe - No fall detected
    if (fallAlert) {
      fallAlert.className = "alert alert-safe p-3 text-center fw-bold";
      fallAlert.innerHTML =
        '<i class="bi bi-shield-check me-2"></i> Client Status: Normal - No Fall Detected';
    }

    if (cameraOutput) cameraOutput.textContent = "No Fall";
    if (cameraStatus) {
      cameraStatus.className = "badge bg-success";
      cameraStatus.textContent = "Safe";
    }

    if (riskLevel) riskLevel.textContent = "Low";
    if (riskStatus) {
      riskStatus.className = "badge bg-success";
      riskStatus.textContent = "Safe";
    }

    if (riskProgress) {
      riskProgress.className = "progress-bar bg-success";
      riskProgress.style.width = "15%";
      riskProgress.textContent = "15%";
    }

    if (motionStatus) {
      motionStatus.className = "badge bg-success";
      motionStatus.textContent = "Normal Activity";
    }

    // Only update fall detection status if no recent falls
    if (fallDetectionStatus && (!lastFallTime || (new Date() - lastFallTime > 60000))) {
      fallDetectionStatus.className = "badge bg-success";
      fallDetectionStatus.textContent = "No Fall";
    }
  } else if (status === 1) {
    // At risk of falling
    if (fallAlert) {
      fallAlert.className = "alert alert-risk p-3 text-center fw-bold";
      fallAlert.innerHTML =
        '<i class="bi bi-exclamation-triangle me-2"></i> Client Status: CAUTION - Fall Risk Detected';
    }

    if (cameraOutput) cameraOutput.textContent = "At Risk";
    if (cameraStatus) {
      cameraStatus.className = "badge bg-warning text-dark";
      cameraStatus.textContent = "Caution";
    }

    if (riskLevel) riskLevel.textContent = "Moderate";
    if (riskStatus) {
      riskStatus.className = "badge bg-warning text-dark";
      riskStatus.textContent = "Caution";
    }

    if (riskProgress) {
      riskProgress.className = "progress-bar bg-warning";
      riskProgress.style.width = "50%";
      riskProgress.textContent = "50%";
    }

    if (motionStatus) {
      motionStatus.className = "badge bg-warning text-dark";
      motionStatus.textContent = "Unsteady Movement";
    }

    if (fallDetectionStatus) {
      fallDetectionStatus.className = "badge bg-warning text-dark";
      fallDetectionStatus.textContent = "Fall Risk";
    }
  } else {
    // Fall detected
    if (fallAlert) {
      fallAlert.className = "alert alert-fall p-3 text-center fw-bold";
      fallAlert.innerHTML =
        '<i class="bi bi-exclamation-circle me-2"></i> ALERT: FALL DETECTED! IMMEDIATE ATTENTION REQUIRED';
    }

    if (cameraOutput) cameraOutput.textContent = "FALL";
    if (cameraStatus) {
      cameraStatus.className = "badge bg-danger";
      cameraStatus.textContent = "Emergency";
    }

    if (riskLevel) riskLevel.textContent = "High";
    if (riskStatus) {
      riskStatus.className = "badge bg-danger";
      riskStatus.textContent = "Emergency";
    }

    if (riskProgress) {
      riskProgress.className = "progress-bar bg-danger";
      riskProgress.style.width = "90%";
      riskProgress.textContent = "90%";
    }

    if (motionStatus) {
      motionStatus.className = "badge bg-danger";
      motionStatus.textContent = "Fall Detected";
    }

    if (fallDetectionStatus) {
      fallDetectionStatus.className = "badge bg-danger";
      fallDetectionStatus.textContent = "Fall Detected";
    }

    // Record a fall event if this is a new fall
    if (previousStatus !== 2 && status === 2) {
      recordFallEvent(2);
    }
  }
}

// Initialize charts
function initializeCharts() {
  try {
    // Heart Rate Chart
    const heartRateCtx = document.getElementById("heartRateChart");
    if (heartRateCtx) {
      heartRateData = Array(MAX_DATA_POINTS).fill(72);

      const heartRateChartData = {
        labels: Array(MAX_DATA_POINTS).fill(""),
        datasets: [
          {
            label: "Heart Rate (bpm)",
            data: heartRateData,
            borderColor: "#2c5282",
            backgroundColor: "rgba(44, 82, 130, 0.1)",
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
            fill: true,
          },
        ],
      };

      heartRateChart = new Chart(heartRateCtx, {
        type: "line",
        data: heartRateChartData,
        options: {
          scales: {
            y: {
              min: 40,
              max: 120,
              ticks: {
                stepSize: 20,
              },
            },
            x: {
              display: false,
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
          maintainAspectRatio: false,
          animation: {
            duration: 0,
          },
        },
      });
    }

    // SpO2 Chart
    const spo2Ctx = document.getElementById("spo2Chart");
    if (spo2Ctx) {
      spo2Data = Array(MAX_DATA_POINTS).fill(98);

      const spo2ChartData = {
        labels: Array(MAX_DATA_POINTS).fill(""),
        datasets: [
          {
            label: "SpO2 (%)",
            data: spo2Data,
            borderColor: "#3182ce",
            backgroundColor: "rgba(49, 130, 206, 0.1)",
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
            fill: true,
          },
        ],
      };

      spo2Chart = new Chart(spo2Ctx, {
        type: "line",
        data: spo2ChartData,
        options: {
          scales: {
            y: {
              min: 90,
              max: 100,
              ticks: {
                stepSize: 2,
              },
            },
            x: {
              display: false,
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
          maintainAspectRatio: false,
          animation: {
            duration: 0,
          },
        },
      });
    }

    // Movement Chart
    const motionCtx = document.getElementById("motionChart");
    if (motionCtx) {
      movementData = Array(MAX_DATA_POINTS).fill(5); // Default to middle of 0-10 scale

      const motionChartData = {
        labels: Array(MAX_DATA_POINTS).fill(""),
        datasets: [
          {
            label: "Movement Level",
            data: movementData,
            borderColor: "#3182ce",
            backgroundColor: "rgba(49, 130, 206, 0.1)",
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
            fill: true,
          },
        ],
      };

      motionChart = new Chart(motionCtx, {
        type: "line",
        data: motionChartData,
        options: {
          scales: {
            y: {
              min: 0,
              max: 10, // Scale now 0-10
              ticks: {
                stepSize: 2,
              },
            },
            x: {
              display: false,
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
          maintainAspectRatio: false,
          animation: {
            duration: 0,
          },
        },
      });
    }

    // Fall Detection Chart
    const fallDetectionCtx = document.getElementById("fallDetectionChart");
    if (fallDetectionCtx) {
      // Initialize with all zeros (no falls)
      fallDetectionData = Array(MAX_DATA_POINTS).fill(0);

      const fallDetectionChartData = {
        labels: Array(MAX_DATA_POINTS).fill(""),
        datasets: [
          {
            label: "Fall Detection",
            data: fallDetectionData,
            borderColor: "#3182ce",
            backgroundColor: "rgba(49, 130, 206, 0.1)",
            borderWidth: 2,
            pointRadius: function (context) {
              const value = context.dataset.data[context.dataIndex];
              return value > 0 ? 5 : 0;
            },
            pointBackgroundColor: function (context) {
              const value = context.dataset.data[context.dataIndex];
              if (value === 2) return "#e53e3e"; // Fall - Red
              if (value === 1) return "#f6ad55"; // Risk - Orange
              return "transparent";
            },
            pointBorderColor: function (context) {
              const value = context.dataset.data[context.dataIndex];
              if (value === 2) return "#e53e3e"; // Fall - Red
              if (value === 1) return "#f6ad55"; // Risk - Orange
              return "transparent";
            },
            stepped: "before",
          },
        ],
      };

      fallDetectionChart = new Chart(fallDetectionCtx, {
        type: "line",
        data: fallDetectionChartData,
        options: {
          scales: {
            y: {
              min: 0,
              max: 3,
              ticks: {
                stepSize: 1,
                callback: function (value) {
                  if (value === 0) return "No Fall";
                  if (value === 1) return "Risk";
                  if (value === 2) return "Fall";
                  return "";
                },
              },
            },
            x: {
              display: false,
            },
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const value = context.parsed.y;
                  if (value === 2) {
                    return "Fall Detected";
                  } else if (value === 1) {
                    return "Fall Risk";
                  } else {
                    return "No Fall";
                  }
                }
              }
            }
          },
          maintainAspectRatio: false,
          animation: {
            duration: 0,
          },
        },
      });
    }

    return {
      heartRateChart,
      spo2Chart,
      motionChart,
      fallDetectionChart,
    };
  } catch (error) {
    console.error("Error initializing charts:", error);
    return {};
  }
}

// Function to simulate demo data showing all states within 2 minutes
function startDemoSimulation() {
  console.log("Starting demo simulation mode");

  // Create cycle of scenarios for demonstration
  const scenarios = [
    // Start with normal state
    { state: "normal", duration: 6 }, // 40 seconds in normal state

    // Show risk state
    { state: "risk", duration: 6 },   // 15 seconds in risk state

    // Return to normal briefly
    { state: "normal", duration: 4 }, // 20 seconds in normal state

    // Show a fall
    { state: "fall", duration: 20 },    // 3 seconds for the fall event

    // Show recovery after fall
    { state: "recovery", duration: 10 }, // 10 seconds recovery

    // Return to normal
    { state: "normal", duration: 9 }  // Rest of the time in normal state
  ];

  let currentScenarioIndex = 0;
  let timeInCurrentScenario = 0;

  // Base values
  let baseHeartRate = 72;
  let baseSpO2 = 98;
  let baseMovement = 5; // Base movement between 0-10

  // Main simulation interval - update every second
  const simulationInterval = setInterval(() => {
    // Get current scenario
    const currentScenario = scenarios[currentScenarioIndex];

    // Generate values based on current scenario
    let heartRate, spo2, movement, fallDetection;

    switch (currentScenario.state) {
      case "normal":
        // Normal variation
        heartRate = Math.round(baseHeartRate + (Math.random() * 8 - 4));
        spo2 = Math.round((baseSpO2 + (Math.random() * 2 - 1)) * 10) / 10;
        movement = (baseMovement + (Math.random() * 2 - 1)).toFixed(1); // 0-10 scale
        fallDetection = 0;
        break;

      case "risk":
        // Unsteady movement pattern
        heartRate = Math.round(baseHeartRate + 10 + (Math.random() * 10 - 5));
        spo2 = Math.round((baseSpO2 - 1 + (Math.random() * 2 - 1)) * 10) / 10;
        movement = (7 + (Math.random() * 3 - 1.5)).toFixed(1); // Higher on 0-10 scale
        fallDetection = 1;
        break;

      case "fall":
        // Dramatic changes during fall
        heartRate = Math.round(baseHeartRate + 25 + (Math.random() * 15));
        spo2 = Math.round((baseSpO2 - 3 + (Math.random() * 2 - 1)) * 10) / 10;

        // Spike in movement followed by very low movement
        if (timeInCurrentScenario === 0) {
          // Initial fall moment - high movement spike
          movement = (9 + (Math.random() * 1)).toFixed(1); // Near max on 0-10 scale
        } else {
          // After fall - very low movement
          movement = (0.5 + (Math.random() * 1)).toFixed(1); // Very low on 0-10 scale
        }

        fallDetection = 2;
        break;

      case "recovery":
        // Gradual return to normal after fall
        const recoveryProgress = timeInCurrentScenario / currentScenario.duration; // 0 to 1

        heartRate = Math.round(baseHeartRate + 15 + (Math.random() * 10 - 5) - (recoveryProgress * 15));
        spo2 = Math.round((baseSpO2 - 2 + (recoveryProgress * 2) + (Math.random() * 1.5 - 0.75)) * 10) / 10;
        movement = (1 + (Math.random() * 1.5) + (recoveryProgress * 3)).toFixed(1); // Gradually increasing on 0-10 scale

        // Start as fall, then transition to risk, then normal
        if (timeInCurrentScenario < 3) {
          fallDetection = 2; // Still showing as fall for initial recovery
        } else if (timeInCurrentScenario < 7) {
          fallDetection = 1; // Risk during mid-recovery
        } else {
          fallDetection = 0; // Back to normal at end of recovery
        }
        break;

      default:
        heartRate = baseHeartRate;
        spo2 = baseSpO2;
        movement = (5).toFixed(1);
        fallDetection = 0;
    }

    // Ensure values are within realistic ranges
    heartRate = Math.max(45, Math.min(130, heartRate));
    spo2 = Math.max(90, Math.min(100, spo2));
    movement = Math.max(0, Math.min(10, parseFloat(movement))); // Keep on 0-10 scale

    // Update dashboard with new data
    updateDashboard({
      heart_rate: heartRate,
      spo2: spo2,
      movement_level: movement,
      fall_detected: fallDetection
    });

    // Update timers and scenario
    timeInCurrentScenario++;
    if (timeInCurrentScenario >= currentScenario.duration) {
      // Move to next scenario
      currentScenarioIndex = (currentScenarioIndex + 1) % scenarios.length;
      timeInCurrentScenario = 0;
    }

  }, 1000); // Update every second

  // Optional: For demo purposes, add a reset function after 2 minutes
  setTimeout(() => {
    // Restart the demo after 2 minutes
    clearInterval(simulationInterval);
    startDemoSimulation();
  }, 120000); // 2 minutes
}

// Handle sidebar toggle
function initializeSidebar() {
  const sidebarToggle = document.getElementById("sidebarToggle");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");

  if (sidebarToggle && sidebar && mainContent) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      mainContent.classList.toggle("expanded");
    });
  }
}

// Main initialization function
function initializeApp() {
  // Initialize UI components
  initializeSidebar();

  // Initialize charts
  const charts = initializeCharts();

  // Set initial fall status
  updateFallStatus(0);

  // Start demo simulation instead of realistic simulation
  startDemoSimulation();
}

// Initialize everything when page loads
document.addEventListener("DOMContentLoaded", initializeApp);