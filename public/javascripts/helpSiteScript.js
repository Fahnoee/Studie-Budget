// Executes after the window has fully loaded
window.onload = function () {
  // Select the video container element
  var videoContainer = document.querySelector('.video-container');

  // Create and configure the iframe element
  var iframe = document.createElement('iframe');
  iframe.setAttribute('width', '1078');
  iframe.setAttribute('height', '541');
  
  // Set the source URL of the iframe to the YouTube video
  iframe.setAttribute('src', 'https://www.youtube.com/embed/C61cY9cCnt4'); 
  iframe.setAttribute('title', 'student budget');
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
  iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  iframe.setAttribute('allowfullscreen', '');

  // Clear existing content and append the iframe
  videoContainer.innerHTML = '';
  videoContainer.appendChild(iframe);
}

