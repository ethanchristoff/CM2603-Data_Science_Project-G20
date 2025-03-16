const slider = document.getElementById('videoSlider');
const prevButton = document.querySelector('.prev');
const nextButton = document.querySelector('.next');
let currentIndex = 0;

function updateSliderPosition() {
    const videoWrappers = document.querySelectorAll('.video-wrapper');
    if (!slider || !videoWrappers.length) return;

    const videoWidth = videoWrappers[0].offsetWidth;
    const gap = 20; 
    const totalOffset = currentIndex * (videoWidth + gap);

    slider.style.transform = `translateX(-${totalOffset}px)`;
}

function prevVideo() {
    const videoCount = document.querySelectorAll('.video-wrapper').length;
    if (videoCount === 0) return;

    currentIndex = currentIndex > 0 ? currentIndex - 1 : videoCount - 1;
    updateSliderPosition();
}

function nextVideo() {
    const videoCount = document.querySelectorAll('.video-wrapper').length;
    if (videoCount === 0) return;

    currentIndex = currentIndex < videoCount - 1 ? currentIndex + 1 : 0;
    updateSliderPosition();
}

if (prevButton) prevButton.addEventListener('click', prevVideo);
if (nextButton) nextButton.addEventListener('click', nextVideo);

window.addEventListener('resize', updateSliderPosition);

document.addEventListener('DOMContentLoaded', updateSliderPosition);