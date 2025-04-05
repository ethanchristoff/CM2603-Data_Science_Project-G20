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

    // Helper function to add a new page with consistent styling
    function addNewPage() {
        pdf.addPage();
        // Add header with logo on new page
        pdf.setFillColor(44, 82, 130);
        pdf.rect(margin, margin, 35, 8, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text("FallGuard Pro", margin + 3, margin + 5.5);

        return margin; // Return the starting Y position for content
    }

    // ===== PAGE 1: CHARTS AND MONITORING DATA =====

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

    // Add key patient status indicators
    const summaryY = infoStartY + 15;
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, summaryY, contentWidth, 12, 'F');

    // Statistics summary (falls, risk level, etc.)
    const stats = [
        { label: "Recent Falls", value: "1" },
        { label: "Fall Risk Level", value: "High" },
        { label: "Mobility Level", value: "Slightly Unstable" },
        { label: "Monitoring Status", value: "Active" }
    ];

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

    // Charts section
    const content = document.querySelector('.main-content');
    const charts = content.querySelectorAll('.chart-container');

    let chartY = summaryY + 20;
    const chartHeight = 50; // Base height for charts
    const chartWidth = contentWidth * 0.8; // Reduced width to maintain aspect ratio
    const chartX = margin + ((contentWidth - chartWidth) / 2); // Center the chart

    // Chart titles
    const chartTitles = [
        "Fall Events",
        "Heart Rate & SpO2 Readings",
        "Movement Activity"
    ];

    // Chart descriptions
    const chartDescriptions = [
        "Weekly summary of detected falls and risk alerts",
        "Vital signs monitoring during the reporting period",
        "Daily physical activity level measurements"
    ];

    for (let i = 0; i < 3; i++) { // Process the first 3 charts
        const canvas = charts[i].querySelector('canvas');

        // Chart title
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.setTextColor(44, 82, 130);
        pdf.text(chartTitles[i], margin, chartY);

        // Chart description
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(chartDescriptions[i], margin, chartY + 4);

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

    // Footer for page 1
    const footerY = 280;
    pdf.setDrawColor(44, 82, 130);
    pdf.setLineWidth(0.2);
    pdf.line(margin, footerY, pageWidth - margin, footerY);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text("Generated by FallGuard Pro", margin, footerY + 4);
    pdf.text(`Report ID: ${generateReportId()}`, margin, footerY + 7);
    pdf.text("Page 1 of 2", pageWidth - margin - 15, footerY + 4);

    // ===== PAGE 2: PATIENT PROFILE DATA =====
    let currentY = addNewPage();
    currentY += 10;

    // Title for page 2
    pdf.setTextColor(44, 82, 130);
    pdf.setFontSize(16);
    pdf.text("Patient Profile & Fall Risk Assessment", margin + 39, margin + 6);

    // Section 1: Personal and Medical Information
    currentY = margin + 15;
    pdf.setFillColor(44, 82, 130);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.rect(margin, currentY, contentWidth, 6, 'F');
    pdf.text("PERSONAL & MEDICAL INFORMATION", margin + 5, currentY + 4);
    currentY += 8;

    // Set text color back to black for content
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);

    // Two column layout
    const col1Width = contentWidth * 0.45;
    const col2Width = contentWidth * 0.45;
    const col2X = margin + contentWidth * 0.55;

    // Column 1 - Basic Info
    currentY += 6;
    pdf.setFont("helvetica", "bold");
    pdf.text("Patient Details", margin, currentY);
    currentY += 4;
    pdf.setFont("helvetica", "normal");
    pdf.text(`Full Name: John Doe`, margin, currentY);
    currentY += 4;
    pdf.text(`Date of Birth: 08/15/1955 (66 years)`, margin, currentY);
    currentY += 4;
    pdf.text(`Gender: Male`, margin, currentY);
    currentY += 4;
    pdf.text(`Weight: 75 kg`, margin, currentY);
    currentY += 4;
    pdf.text(`Height: 178 cm`, margin, currentY);
    currentY += 4;
    pdf.text(`Phone: 555-123-4567`, margin, currentY);
    currentY += 4;
    pdf.text(`Email: john.doe@example.com`, margin, currentY);

    // Column 2 - Medical Info
    let col2Y = currentY - 24;
    pdf.setFont("helvetica", "bold");
    pdf.text("Medical Information", col2X, col2Y);
    col2Y += 4;
    pdf.setFont("helvetica", "normal");
    pdf.text(`Primary Doctor: Dr. Emily Johnson`, col2X, col2Y);
    col2Y += 4;
    pdf.text(`Doctor's Phone: 555-444-3333`, col2X, col2Y);
    col2Y += 4;
    pdf.text(`Allergies: Penicillin, Peanuts`, col2X, col2Y);

    // Medications with wrapped text
    col2Y += 6;
    pdf.setFont("helvetica", "bold");
    pdf.text(`Current Medications:`, col2X, col2Y);
    pdf.setFont("helvetica", "normal");
    col2Y += 4;
    pdf.text(`• Lisinopril 10mg (daily)`, col2X, col2Y);
    col2Y += 4;
    pdf.text(`• Atorvastatin 20mg (daily)`, col2X, col2Y);
    col2Y += 4;
    pdf.text(`• Metformin 500mg (twice daily)`, col2X, col2Y);

    // Emergency contacts
    currentY += 10;
    pdf.setFont("helvetica", "bold");
    pdf.text("Emergency Contacts", margin, currentY);
    currentY += 4;
    pdf.setFont("helvetica", "normal");
    pdf.text(`Primary: Jane Doe (Daughter) - 555-987-6543`, margin, currentY);
    currentY += 4;
    pdf.text(`Secondary: Robert Smith (Son) - 555-456-7890`, margin, currentY);

    // Section 2: Fall Risk Assessment
    currentY += 10;
    pdf.setFillColor(44, 82, 130);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.rect(margin, currentY, contentWidth, 6, 'F');
    pdf.text("FALL RISK ASSESSMENT", margin + 5, currentY + 4);
    currentY += 8;

    // Reset text color to black
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);

    // Medical conditions
    currentY += 6
    pdf.setFont("helvetica", "bold");
    pdf.text("Medical Conditions", margin, currentY);
    currentY += 4;
    pdf.setFont("helvetica", "normal");
    const conditions = ["Arthritis", "Diabetes", "Heart Disease", "Hypertension", "Dizziness/Vertigo", "Visual Impairment"];
    let conditionText = conditions.join(", ");
    pdf.text(conditionText, margin, currentY);

    // Fall history
    currentY += 6;
    pdf.setFont("helvetica", "bold");
    pdf.text("Fall History", margin, currentY);
    currentY += 4;
    pdf.setFont("helvetica", "normal");
    pdf.text(`Previous Falls (Past 12 Months): 2 falls`, margin, currentY);
    currentY += 4;
    pdf.text(`Injuries from Previous Falls: Minor (bruises)`, margin, currentY);
    currentY += 4;
    pdf.text(`Circumstances:`, margin, currentY);

    // Circumstances with text wrapping
    currentY += 4;
    const circumstances = "First fall occurred when getting up at night to use bathroom. Second fall happened while walking down steps carrying laundry.";
    const splitCircumstances = pdf.splitTextToSize(circumstances, contentWidth - 10);
    pdf.text(splitCircumstances, margin + 5, currentY);
    currentY += splitCircumstances.length * 4;

    // Mobility information
    currentY += 2;
    pdf.setFont("helvetica", "bold");
    pdf.text("Mobility Assessment", margin, currentY);
    currentY += 4;
    pdf.setFont("helvetica", "normal");
    pdf.text(`Mobility Aid Used: Cane`, margin, currentY);
    currentY += 4;
    pdf.text(`Gait Stability: Slightly Unstable`, margin, currentY);
    currentY += 4;
    pdf.text(`Balance Confidence: 6/10 (Medium)`, margin, currentY);
    currentY += 4;
    pdf.text(`Specific Difficulties: Standing from seated position, Using stairs`, margin, currentY);

    // Home environment
    currentY += 6;
    pdf.setFont("helvetica", "bold");
    pdf.text("Home Environment Risk Factors", margin, currentY);
    currentY += 4;
    pdf.setFont("helvetica", "normal");
    const homeRisks = ["Loose Rugs/Mats", "Clutter/Obstacles", "Stairs without Railings", "Poor Lighting"];
    pdf.text(homeRisks.join(", "), margin, currentY);

    // Additional information
    currentY += 6;
    pdf.setFont("helvetica", "bold");
    pdf.text("Additional Information", margin, currentY);
    currentY += 4;
    pdf.setFont("helvetica", "normal");
    const additionalInfo = "Patient expresses anxiety about falling, especially at night. Has difficulty with depth perception. Recently changed blood pressure medication which caused some dizziness initially.";
    const splitAdditionalInfo = pdf.splitTextToSize(additionalInfo, contentWidth - 10);
    pdf.text(splitAdditionalInfo, margin, currentY);
    currentY += splitAdditionalInfo.length * 4;

    // Section 3: System Configuration
    currentY += 6;
    pdf.setFillColor(44, 82, 130);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.rect(margin, currentY, contentWidth, 6, 'F');
    pdf.text("SYSTEM CONFIGURATION", margin + 5, currentY + 4);
    currentY += 8;

    // Reset text color
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");

    // System config details
    currentY += 6;
    pdf.text(`Fall Detection Sensitivity: Medium`, margin, currentY);
    currentY += 4;
    pdf.text(`Notification Preference: Emergency Contact + Care Provider`, margin, currentY);
    currentY += 4;
    pdf.text(`Alert Confirmation Time: 30 seconds`, margin, currentY);
    currentY += 4;
    pdf.text(`Monitoring Schedule: 24/7 Monitoring`, margin, currentY);

    // Footer for page 2
    pdf.setDrawColor(44, 82, 130);
    pdf.setLineWidth(0.2);
    pdf.line(margin, footerY, pageWidth - margin, footerY);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text("Generated by FallGuard Pro", margin, footerY + 4);
    pdf.text(`Report ID: ${generateReportId()}`, margin, footerY + 7);
    pdf.text("Page 2 of 2", pageWidth - margin - 15, footerY + 4);

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

