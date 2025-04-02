const slider = document.getElementById('videoSlider');
const prevButton = document.querySelector('.prev');
const nextButton = document.querySelector('.next');
let currentIndex = 0;
let isAnimating = false; 

function updateSliderPosition() {
    if (!slider) return;

    const videoWrappers = document.querySelectorAll('.video-wrapper');
    if (videoWrappers.length === 0) return;

    const videoWidth = videoWrappers[0].offsetWidth;
    const gap = 20; 
    const totalOffset = currentIndex * (videoWidth + gap);

    slider.style.transition = 'transform 0.3s ease-in-out';
    slider.style.transform = `translateX(-${totalOffset}px)`;

    setTimeout(() => {
        slider.style.transition = 'none';
    }, 300);
}

function prevVideo() {
    if (isAnimating) return;
    isAnimating = true;

    const videoCount = document.querySelectorAll('.video-wrapper').length;
    if (videoCount === 0) return;

    currentIndex = (currentIndex > 0) ? currentIndex - 1 : videoCount - 1;
    updateSliderPosition();

    setTimeout(() => {
        isAnimating = false;
    }, 300);
}

function nextVideo() {
    if (isAnimating) return;
    isAnimating = true;

    const videoCount = document.querySelectorAll('.video-wrapper').length;
    if (videoCount === 0) return;

    currentIndex = (currentIndex < videoCount - 1) ? currentIndex + 1 : 0;
    updateSliderPosition();

    setTimeout(() => {
        isAnimating = false;
    }, 300);
}

if (prevButton) prevButton.addEventListener('click', prevVideo);
if (nextButton) nextButton.addEventListener('click', nextVideo);

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        updateSliderPosition();
    }, 100);
});

document.addEventListener('DOMContentLoaded', updateSliderPosition);