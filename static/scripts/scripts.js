fetch('static/movies.json')
    .then(response => response.json())
    .then(movies => {
        const container = document.getElementById('movies-container');

        // Populate the carousel with movie items
        movies.forEach(movie => {
            const movieDiv = document.createElement('div');
            movieDiv.classList.add('movie-item');
            movieDiv.innerHTML = `
                <img src="${movie.poster}" alt="${movie.alt}">
                <p>${movie.title}</p>
                <a href="#" class="film-detail-link">Film Details</a>
            `;
            container.appendChild(movieDiv);
        });

        // Duplicate the first few items at the end for seamless looping
        for (let i = 0; i < 10; i++) { // Duplicate enough for large screens
            const clone = container.children[i].cloneNode(true);
            container.appendChild(clone);
        }

        // Adjust carousel on load and resize
        adjustCarousel();
        window.addEventListener('resize', adjustCarousel);

        // Start auto-scroll
        startAutoScroll();
    })
    .catch(error => console.error('Error loading movies:', error));

// Carousel functionality
let currentSlide = 0;

function adjustCarousel() {
    const track = document.querySelector('.carousel-track');
    const movieItems = document.querySelectorAll('.movie-item');
    const screenWidth = window.innerWidth;

    // Calculate number of movies to display based on screen width
    let moviesToShow = Math.floor(screenWidth / 150); // Example: 150px per item with gaps
    moviesToShow = Math.max(3, Math.min(moviesToShow, 10)); // Limit between 3 and 10 movies

    // Set the width of each movie item to fit the number of movies in the viewport
    const itemWidth = 100 / moviesToShow;
    movieItems.forEach(item => {
        item.style.minWidth = `calc(${itemWidth}% - 15px)`; // Subtract gap
    });
}

function moveSlide(direction) {
    const track = document.querySelector('.carousel-track');
    const movieWidth = document.querySelector('.movie-item').offsetWidth + 15; // Include gap
    const totalMovies = document.querySelectorAll('.movie-item').length;

    currentSlide = (currentSlide + direction + totalMovies) % totalMovies;

    // Loop back to the start when reaching the end of cloned items
    if (currentSlide >= totalMovies - 10 && direction === 1) {
        setTimeout(() => {
            track.style.transition = 'none';
            track.style.transform = `translateX(0)`;
            currentSlide = 0;
        }, 500);
    } else {
        track.style.transition = 'transform 0.5s ease';
        track.style.transform = `translateX(-${currentSlide * movieWidth}px)`;
    }
}

// Auto-scroll function
function startAutoScroll() {
    setInterval(() => {
        moveSlide(1); // Move one movie to the right every interval
    }, 3000); // Adjust timing as needed (3000ms = 3 seconds)
}


// Video playback and mute toggle
window.addEventListener('load', function() {
    const video = document.getElementById('trailerVideo');
    if (video) {
        video.play().catch(error => console.log('Video play failed:', error));
    }
});

function toggleMute() {
    const video = document.getElementById('trailerVideo');
    const speakerButton = document.getElementById('speakerButton');
    if (video.muted) {
        video.muted = false;
        speakerButton.textContent = "🔊";  // Change icon to indicate unmuted
    } else {
        video.muted = true;
        speakerButton.textContent = "🔈";  // Change icon to indicate muted
    }
}
