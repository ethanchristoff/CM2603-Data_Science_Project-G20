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
        const video = document.createElement('video');
        video.src = videoSrc;
        video.controls = true;
        slider.appendChild(video);
    });
}

function prevVideo() {
    if (currentIndex > 0) {
        currentIndex--;
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
}

function nextVideo() {
    if (currentIndex < videos.length - 1) {
        currentIndex++;
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
}

function addNewVideo() {
    const newVideo = prompt("Enter the URL of the new video:");
    if (newVideo) {
        videos.push(newVideo);
        loadVideos();
    }
}

loadVideos();