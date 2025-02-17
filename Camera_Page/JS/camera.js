const videos = [
    'videos/fall1.mp4',
    'videos/fall2.mp4',
    'videos/fall3.mp4'
];

const slider = document.getElementById('videoSlider');
let currentIndex = 0;

function loadVideos() {
    slider.innerHTML = '';
    videos.forEach(videoSrc => {
        const videoWrapper = document.createElement('div'); // Wrapper for spacing
        videoWrapper.classList.add('video-wrapper');

        const video = document.createElement('video');
        video.src = videoSrc;
        video.controls = true;
        videoWrapper.appendChild(video);
        
        slider.appendChild(videoWrapper);
    });

    updateSliderPosition();
}

function updateSliderPosition() {
    const videoWidth = document.querySelector('.slider video').offsetWidth;
    slider.style.transform = `translateX(-${currentIndex * (videoWidth + 20)}px)`;
}

function prevVideo() {
    if (currentIndex > 0) {
        currentIndex--;
        updateSliderPosition();
    }
}

function nextVideo() {
    if (currentIndex < videos.length - 1) {
        currentIndex++;
        updateSliderPosition();
    }
}

function addNewVideo() {
    const newVideo = prompt("Enter the URL of the new video:");
    if (newVideo) {
        videos.push(newVideo);
        loadVideos();
    }
}

window.addEventListener("resize", updateSliderPosition);
loadVideos();
