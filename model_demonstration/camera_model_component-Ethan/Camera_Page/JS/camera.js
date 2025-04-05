// Sidebar Toggle Functionality
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('mainContent');

sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
});

const videos = [
    'videos/fall1.mp4',
    'videos/fall2.mp4',
    'videos/fall3.mp4',
    'videos/fall4.mp4', 
  ];
  
  const slider = document.getElementById('videoSlider');
  let currentIndex = 0;
  
  // Load videos dynamically
  function loadVideos() {
    slider.innerHTML = ''; // Clear existing videos
  
    videos.forEach((videoSrc) => {
      const videoWrapper = document.createElement('div');
      videoWrapper.classList.add('video-wrapper');
  
      const video = document.createElement('video');
      video.src = videoSrc;
      video.controls = true;
  
      videoWrapper.appendChild(video);
      slider.appendChild(videoWrapper);
    });
  
    updateSliderPosition(); // Position videos correctly
  }
  
  // Update slider position based on the current index
  function updateSliderPosition() {
    const videoWrapper = document.querySelector('.video-wrapper');
    if (!videoWrapper) return;
  
    const videoWidth = videoWrapper.getBoundingClientRect().width;
    const gap = 20; // Matches CSS gap
    const totalOffset = currentIndex * (videoWidth + gap);
  
    slider.style.transform = `translateX(-${totalOffset}px)`;
  }
  
  // Navigate to the previous video
  function prevVideo() {
    if (currentIndex > 0) {
      currentIndex--;
      updateSliderPosition();
    }
  }
  
  // Navigate to the next video
  function nextVideo() {
    if (currentIndex < videos.length - 1) {
      currentIndex++;
      updateSliderPosition();
    }
  }
  
  // Recalculate slider position on window resize
  window.addEventListener('resize', updateSliderPosition);
  
  // Initialize on page load
  document.addEventListener('DOMContentLoaded', loadVideos);  