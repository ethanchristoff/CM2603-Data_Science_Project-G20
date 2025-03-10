// Video Slider Functionality
const slider = document.getElementById('videoSlider');
const prevButton = document.querySelector('.prev');
const nextButton = document.querySelector('.next');
let currentIndex = 0;

// Update slider position
function updateSliderPosition() {
    const videoWrappers = document.querySelectorAll('.video-wrapper');
    if (!slider || !videoWrappers.length) return;

    const videoWidth = videoWrappers[0].offsetWidth;
    const gap = 20; // Should match CSS gap
    const totalOffset = currentIndex * (videoWidth + gap);

    slider.style.transform = `translateX(-${totalOffset}px)`;
}

// Navigate to previous video
function prevVideo() {
    const videoCount = document.querySelectorAll('.video-wrapper').length;
    if (videoCount === 0) return;

    currentIndex = currentIndex > 0 ? currentIndex - 1 : videoCount - 1;
    updateSliderPosition();
}

// Navigate to next video
function nextVideo() {
    const videoCount = document.querySelectorAll('.video-wrapper').length;
    if (videoCount === 0) return;

    currentIndex = currentIndex < videoCount - 1 ? currentIndex + 1 : 0;
    updateSliderPosition();
}

// Attach event listeners only if elements exist
if (prevButton) prevButton.addEventListener('click', prevVideo);
if (nextButton) nextButton.addEventListener('click', nextVideo);

// Recalculate on window resize
window.addEventListener('resize', updateSliderPosition);

// Initialize slider position on page load
document.addEventListener('DOMContentLoaded', updateSliderPosition);