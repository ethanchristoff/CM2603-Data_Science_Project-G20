/*
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

async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');

    // Hide the print button
    const button = document.getElementById("printButton");
    button.style.display = "none";

    // Define margins and dimensions
    const margin = 15;
    const pageWidth = 210; // A4 width
    const contentWidth = pageWidth - (2 * margin);

    // Header with logo
    pdf.setFillColor(44, 82, 130);
    pdf.rect(margin, margin, 35, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("FallGuard Pro", margin + 3, margin + 5.5);

    // Report title
    pdf.setTextColor(44, 82, 130);
    pdf.setFontSize(16);
    pdf.text("Weekly Health Monitoring Report", margin + 39, margin + 6);

    // Patient info in compact two-column layout
    const infoStartY = margin + 15;
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);

    // Left column
    pdf.setFont("helvetica", "bold");
    pdf.text("Patient:", margin, infoStartY);
    pdf.setFont("helvetica", "normal");
    pdf.text("John Doe", margin + 20, infoStartY);

    pdf.setFont("helvetica", "bold");
    pdf.text("Report Period:", margin, infoStartY + 5);
    pdf.setFont("helvetica", "normal");
    pdf.text(getDateRange(), margin + 30, infoStartY + 5);

    // Right column
    const rightCol = pageWidth / 2 + 10;
    pdf.setFont("helvetica", "bold");
    pdf.text("Age:", rightCol, infoStartY);
    pdf.setFont("helvetica", "normal");
    pdf.text("66", rightCol + 15, infoStartY);

    pdf.setFont("helvetica", "bold");
    pdf.text("Generated:", rightCol, infoStartY + 5);
    pdf.setFont("helvetica", "normal");
    pdf.text(formatDateTime(new Date()), rightCol + 25, infoStartY + 5);

    // Summary statistics in a compact grid
    const summaryY = infoStartY + 15;
    const stats = [
        { label: "Total Falls", value: "2" },
        { label: "Avg Heart Rate", value: "72 bpm" },
        { label: "Movement Level", value: "65%" },
        { label: "Total Alerts", value: "3" }
    ];

    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, summaryY, contentWidth, 12, 'F');

    const statWidth = contentWidth / 4;
    stats.forEach((stat, index) => {
        const xPos = margin + (statWidth * index);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.text(stat.label, xPos + 5, summaryY + 4);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        pdf.text(stat.value, xPos + 5, summaryY + 9);
    });

    // Charts section with better proportions
    const content = document.querySelector('.main-content');
    const charts = content.querySelectorAll('.chart-container');

    let chartY = summaryY + 20;
    const chartHeight = 50; // Base height for charts
    const chartWidth = contentWidth * 0.8; // Reduced width to maintain aspect ratio
    const chartX = margin + ((contentWidth - chartWidth) / 2); // Center the chart

    for (let i = 0; i < 3; i++) { // Only process the first 3 charts
        const canvas = charts[i].querySelector('canvas');
        const chartTitle = canvas.closest('.card').querySelector('.card-title').textContent;

        // Chart title
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.setTextColor(44, 82, 130);
        pdf.text(chartTitle, margin, chartY);

        // Add chart background and border
        pdf.setFillColor(252, 252, 252);
        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(chartX - 2, chartY + 3, chartWidth + 4, chartHeight + 4, 2, 2, 'FD');

        // Capture and add chart
        await html2canvas(canvas, {
            scale: 3,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', chartX, chartY + 5, chartWidth, chartHeight);
        });

        chartY += chartHeight + 20; // Space between charts
    }

    // Footer
    const footerY = 280;
    pdf.setDrawColor(44, 82, 130);
    pdf.setLineWidth(0.2);
    pdf.line(margin, footerY, pageWidth - margin, footerY);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text("Generated by FallGuard Pro", margin, footerY + 4);
    pdf.text(`Report ID: ${generateReportId()}`, margin, footerY + 7);
    pdf.text("Page 1 of 1", pageWidth - margin - 15, footerY + 4);

    // Restore button and save PDF
    button.style.display = "block";
    pdf.save(`FallGuard_Report_${formatDate(new Date())}.pdf`);
}

// Helper functions remain the same
function getDateRange() {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    return `${formatDate(start)} to ${formatDate(end)}`;
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function formatDateTime(date) {
    return `${formatDate(date)} ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
}

function generateReportId() {
    return 'RPT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}*/


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

// More realistic data for falls - showing risk alerts vs actual falls
const fallsData = {
    labels: days,
    datasets: [
        {
            label: 'Actual Falls',
            data: [0, 0, 1, 0, 0, 0, 0], // Only 1 actual fall during the week
            backgroundColor: '#dc3545', // Red color for actual falls
            barPercentage: 0.5,
        },
        {
            label: 'Fall Risk Alerts',
            data: [1, 0, 2, 0, 0, 1, 0], // A few risk alerts throughout the week
            backgroundColor: '#ffc107', // Yellow color for risk alerts
            barPercentage: 0.5,
        }
    ]
};

// Heart rate data with SpO2 levels added
// Note the spike in heart rate on Wednesday when the fall occurred
const heartRateData = {
    labels: days,
    datasets: [
        {
            label: 'Heart Rate (BPM)',
            data: [72, 71, 85, 74, 73, 70, 72], // Higher heart rate on day of fall (Wed)
            borderColor: '#0d6efd', // Blue
            tension: 0.3,
            fill: false,
            yAxisID: 'y'
        },
        {
            label: 'SpO2 (%)',
            data: [96, 97, 94, 96, 97, 96, 97], // Slight drop in SpO2 on day of fall
            borderColor: '#20c997', // Green
            tension: 0.3,
            fill: false,
            yAxisID: 'y1'
        }
    ]
};

// Movement data showing lower activity on day of fall and day after
const movementData = {
    labels: days,
    datasets: [{
        label: 'Movement Activity (%)',
        data: [65, 72, 45, 52, 67, 70, 68], // Lower activity on Wednesday (fall day) and Thursday (recovery)
        borderColor: '#6f42c1',
        backgroundColor: 'rgba(111, 66, 193, 0.2)',
        tension: 0.3,
        fill: true
    }]
};

// Chart Configuration
const fallsChartConfig = {
    type: 'bar',
    data: fallsData,
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Number of Events'
                },
                max: 3 // Set max to 3 for better visibility
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    title: function(context) {
                        return context[0].label;
                    },
                    label: function(context) {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;
                        return `${label}: ${value} ${value === 1 ? 'time' : 'times'}`;
                    }
                }
            }
        }
    }
};

const heartRateChartConfig = {
    type: 'line',
    data: heartRateData,
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Heart Rate (BPM)'
                },
                min: 60,
                max: 100
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'SpO2 (%)'
                },
                min: 90,
                max: 100,
                grid: {
                    drawOnChartArea: false
                }
            }
        }
    }
};

const movementChartConfig = {
    type: 'line',
    data: movementData,
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Activity Level (%)'
                },
                max: 100
            }
        }
    }
};

// Create Charts
new Chart(document.getElementById('fallsChart'), fallsChartConfig);
new Chart(document.getElementById('heartRateChart'), heartRateChartConfig);
new Chart(document.getElementById('movementChart'), movementChartConfig);


async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');

    // Hide the print button
    const button = document.getElementById("printButton");
    button.style.display = "none";

    // Define margins and dimensions
    const margin = 15;
    const pageWidth = 210; // A4 width
    const contentWidth = pageWidth - (2 * margin);

    // Header with logo
    pdf.setFillColor(44, 82, 130);
    pdf.rect(margin, margin, 35, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("FallGuard Pro", margin + 3, margin + 5.5);

    // Report title
    pdf.setTextColor(44, 82, 130);
    pdf.setFontSize(16);
    pdf.text("Weekly Health Monitoring Report", margin + 39, margin + 6);

    // Patient info in compact two-column layout
    const infoStartY = margin + 15;
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);

    // Left column
    pdf.setFont("helvetica", "bold");
    pdf.text("Patient:", margin, infoStartY);
    pdf.setFont("helvetica", "normal");
    pdf.text("John Doe", margin + 20, infoStartY);

    pdf.setFont("helvetica", "bold");
    pdf.text("Report Period:", margin, infoStartY + 5);
    pdf.setFont("helvetica", "normal");
    pdf.text(getDateRange(), margin + 30, infoStartY + 5);

    // Right column
    const rightCol = pageWidth / 2 + 10;
    pdf.setFont("helvetica", "bold");
    pdf.text("Age:", rightCol, infoStartY);
    pdf.setFont("helvetica", "normal");
    pdf.text("66", rightCol + 15, infoStartY);

    pdf.setFont("helvetica", "bold");
    pdf.text("Generated:", rightCol, infoStartY + 5);
    pdf.setFont("helvetica", "normal");
    pdf.text(formatDateTime(new Date()), rightCol + 25, infoStartY + 5);

    // Summary statistics in a compact grid - define summaryY and stats here
    const summaryY = infoStartY + 15;
    const stats = [
    ];

    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, summaryY, contentWidth, 12, 'F');

    const statWidth = contentWidth / 4;
    stats.forEach((stat, index) => {
        const xPos = margin + (statWidth * index);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.text(stat.label, xPos + 5, summaryY + 4);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        pdf.text(stat.value, xPos + 5, summaryY + 9);
    });

    // Charts section with better proportions
    const content = document.querySelector('.main-content');
    const charts = content.querySelectorAll('.chart-container');

    let chartY = summaryY + 20;
    const chartHeight = 50; // Base height for charts
    const chartWidth = contentWidth * 0.8; // Reduced width to maintain aspect ratio
    const chartX = margin + ((contentWidth - chartWidth) / 2); // Center the chart

    for (let i = 0; i < 3; i++) { // Only process the first 3 charts
        const canvas = charts[i].querySelector('canvas');
        const chartCard = canvas.closest('.card-body');
        const chartTitle = chartCard.querySelector('.card-title').textContent;
        const chartDescription = chartCard.querySelector('.text-muted').textContent;

        // Chart title
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.setTextColor(44, 82, 130);
        pdf.text(chartTitle, margin, chartY);

        // Chart description
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(chartDescription, margin, chartY + 4);

        // Add chart background and border
        pdf.setFillColor(252, 252, 252);
        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(chartX - 2, chartY + 6, chartWidth + 4, chartHeight + 4, 2, 2, 'FD');

        // Capture and add chart
        await html2canvas(canvas, {
            scale: 3,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', chartX, chartY + 8, chartWidth, chartHeight);
        });

        chartY += chartHeight + 25; // Space between charts
    }

    // Active monitors table
    const monitorY = chartY + 5;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(44, 82, 130);
    pdf.text("Active Monitors", margin, monitorY);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text("Shows all monitoring devices currently active in the system", margin, monitorY + 4);

    // Create a simple table
    const tableY = monitorY + 8;
    const monitors = [
        { name: "Camera 2", location: "Bedroom" },
        { name: "Wearable Sensor", location: "Wrist Device" }
    ];

    // Table header
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, tableY, contentWidth, 6, 'F');
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Monitor", margin + 5, tableY + 4);
    pdf.text("Location", margin + contentWidth/2, tableY + 4);

    // Table rows
    monitors.forEach((monitor, index) => {
        const rowY = tableY + 6 + (index * 6);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(0, 0, 0);
        pdf.setDrawColor(230, 230, 230);

        // Alternating row background
        if (index % 2 === 0) {
            pdf.setFillColor(250, 250, 250);
            pdf.rect(margin, rowY, contentWidth, 6, 'F');
        }

        pdf.text("• " + monitor.name, margin + 5, rowY + 4);
        pdf.text(monitor.location, margin + contentWidth/2, rowY + 4);

        // Row divider
        pdf.line(margin, rowY + 6, margin + contentWidth, rowY + 6);
    });

    // Footer
    const footerY = 280;
    pdf.setDrawColor(44, 82, 130);
    pdf.setLineWidth(0.2);
    pdf.line(margin, footerY, pageWidth - margin, footerY);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text("Generated by FallGuard Pro", margin, footerY + 4);
    pdf.text(`Report ID: ${generateReportId()}`, margin, footerY + 7);
    pdf.text("Page 1 of 1", pageWidth - margin - 15, footerY + 4);

    // Restore button and save PDF
    button.style.display = "block";
    pdf.save(`FallGuard_Report_${formatDate(new Date())}.pdf`);
}

// Helper functions remain the same
function getDateRange() {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    return `${formatDate(start)} to ${formatDate(end)}`;
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function formatDateTime(date) {
    return `${formatDate(date)} ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
}

function generateReportId() {
    return 'RPT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}