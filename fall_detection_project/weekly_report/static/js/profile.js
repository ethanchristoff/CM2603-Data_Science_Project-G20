// Sidebar toggle functionality
document.getElementById('sidebarToggle').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('collapsed');
    document.getElementById('mainContent').classList.toggle('expanded');
});

// Profile edit functionality
document.getElementById('editProfileBtn').addEventListener('click', function() {
    // Enable all form inputs
    const formInputs = document.querySelectorAll('#profileForm input, #profileForm select, #profileForm textarea');
    formInputs.forEach(input => {
        input.disabled = false;
    });

    // Show save and cancel buttons
    document.getElementById('saveProfileBtn').style.display = 'inline-block';
    document.getElementById('cancelEditBtn').style.display = 'inline-block';

    // Hide edit button
    this.style.display = 'none';
});

// Cancel edit functionality
document.getElementById('cancelEditBtn').addEventListener('click', function() {
    // Disable all form inputs
    const formInputs = document.querySelectorAll('#profileForm input, #profileForm select, #profileForm textarea');
    formInputs.forEach(input => {
        input.disabled = true;
    });

    // Reset form to original values
    document.getElementById('profileForm').reset();

    // Hide save and cancel buttons
    document.getElementById('saveProfileBtn').style.display = 'none';
    document.getElementById('cancelEditBtn').style.display = 'none';

    // Show edit button
    document.getElementById('editProfileBtn').style.display = 'inline-block';
});

// Form submission
document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Here you would normally send the data to the server
    // For demo purposes, just show an alert and disable the inputs

    // Show success message
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show';
    alertDiv.innerHTML = `
        <strong>Success!</strong> Profile updated successfully.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.querySelector('.card-body').prepend(alertDiv);

    // Disable all form inputs
    const formInputs = document.querySelectorAll('#profileForm input, #profileForm select, #profileForm textarea');
    formInputs.forEach(input => {
        input.disabled = true;
    });

    // Hide save and cancel buttons
    document.getElementById('saveProfileBtn').style.display = 'none';
    document.getElementById('cancelEditBtn').style.display = 'none';

    // Show edit button
    document.getElementById('editProfileBtn').style.display = 'inline-block';

    // Auto-dismiss alert after 5 seconds
    setTimeout(() => {
        const alert = document.querySelector('.alert');
        if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 5000);
});