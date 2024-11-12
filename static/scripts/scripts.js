fetch('static/movies.json')
    .then(response => response.json())
    .then(movies => {
        const container = document.getElementById('movies-container');

        // Populate the carousel with movie items
        movies.forEach((movie, index) => {
            const movieDiv = document.createElement('div');
            movieDiv.classList.add('movie-item');
            movieDiv.innerHTML = `
                <button onclick="showMovieDetails(${index})" class="movie-button">
                    <img src="${movie.poster}" alt="${movie.alt}">
                    <p>${movie.title}</p>
                </button>
            `;
            container.appendChild(movieDiv);
        });

        // Store movie data globally for modal access
        window.moviesData = movies;

        // Duplicate items for seamless looping
        for (let i = 0; i < 10; i++) {
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

async function fetchShowtimeData() {
    try {
         const response = await fetch("/static/ticket-database/data.json");
        const data = await response.json();
        console.log("Fetched data:", data); // Add this line
        return data.theaters;
    } catch (error) {
            console.error("Error fetching showtime data:", error);
    }
}
    


// Carousel Functionality
let currentSlide = 0;

function adjustCarousel() {
    const track = document.querySelector('.carousel-track');
    const movieItems = document.querySelectorAll('.movie-item');
    const screenWidth = window.innerWidth;

    let moviesToShow = Math.floor(screenWidth / 150);
    moviesToShow = Math.max(3, Math.min(moviesToShow, 10));

    const itemWidth = 100 / moviesToShow;
    movieItems.forEach(item => {
        item.style.minWidth = `calc(${itemWidth}% - 15px)`;
    });
}

function moveSlide(direction) {
    const track = document.querySelector('.carousel-track');
    const movieWidth = document.querySelector('.movie-item').offsetWidth + 15;
    const totalMovies = document.querySelectorAll('.movie-item').length;

    currentSlide = (currentSlide + direction + totalMovies) % totalMovies;

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

function startAutoScroll() {
    setInterval(() => {
        moveSlide(1);
    }, 3000);
}

// Function to load showtimes from data.json based on theater number
async function loadShowtimes(theaterNumber) {
    try {
        // Add a cache-busting parameter to ensure we fetch the latest data
        const response = await fetch(`/static/ticket-database/data.json?timestamp=${new Date().getTime()}`);
        
        // Check if response is okay
        if (!response.ok) {
            console.error("Failed to load data.json:", response.statusText);
            return [];
        }

        const data = await response.json();
        console.log("Loaded data:", data); // Debugging: see the entire JSON structure

        // Find the theater by theater_id
        const theater = data.theaters.find(theater => theater.theater_id === theaterNumber);
        if (!theater) {
            console.warn(`Theater ${theaterNumber} not found in data.json`);
            return [];
        }

        console.log("Found theater:", theater); // Debugging: see the theater object

        // Extract only the time from each showtime's start_time
        const showtimes = theater.showtimes.map(showtime => {
            const time = new Date(showtime.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return time;
        });

        console.log("Extracted showtimes:", showtimes); // Debugging: see the showtimes array
        return showtimes;
    } catch (error) {
        console.error("Error loading showtimes:", error);
        return [];
    }
}


// Modal Functionality
async function showMovieDetails(index) {
    const movie = window.moviesData[index];

    document.getElementById('modalPoster').src = movie.poster;
    document.getElementById('modalTitle').textContent = movie.title;
    document.getElementById('modalRating').innerHTML = `<strong>Rating:</strong> ${movie.rating}`;
    document.getElementById('modalRuntime').innerHTML = `<strong>Runtime:</strong> ${movie.runtime}`;
    document.getElementById('modalGenre').innerHTML = `<strong>Genre:</strong> ${movie.genre.join(', ')}`;
    document.getElementById('modalTheatre').innerHTML = `<strong>Theatre:</strong> ${movie.theatre}`;
    document.getElementById('modalCast').innerHTML = `<strong>Cast:</strong> ${movie.cast.join(', ')}`;

    // Set the trailer source but hide it initially
    const trailer = document.getElementById('modalTrailer');
    trailer.src = movie.trailer;
    trailer.style.display = 'none';
    trailer.autoplay = false; // Ensure autoplay is initially off

    // Ensure "Watch Trailer" button is visible
    document.getElementById('watchTrailerButton').style.display = 'inline-block';

    // Load and display available showtimes for the selected theater
    const showtimes = await loadShowtimes(parseInt(movie.theatre, 10)); // Ensure theatre ID is an integer
    const showtimeElement = document.getElementById('modalShowtimes');
    showtimeElement.innerHTML = `<strong>Showtimes:</strong> ${showtimes.join(', ')}`;

    // Display the modal
    document.getElementById('movieModal').style.display = 'flex'; 
}


// Show trailer video with autoplay when "Watch Trailer" button is clicked
function showTrailer() {
    const trailer = document.getElementById('modalTrailer');
    trailer.style.display = 'block'; // Show the trailer
    trailer.autoplay = true; // Enable autoplay
    trailer.play(); // Play the video immediately
    document.getElementById('watchTrailerButton').style.display = 'none'; // Hide the button
}

function closeModal() {
    document.getElementById('movieModal').style.display = 'none';
    const trailer = document.getElementById('modalTrailer');
    trailer.style.display = 'none'; // Hide the trailer when closing the modal
    trailer.pause(); // Pause trailer playback
    trailer.removeAttribute('src'); // Remove the source to stop the video
    trailer.load(); // Reset the video element
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

function getTickets() {
    // Retrieve the movie title and theater number from the modal
    const movieTitle = document.getElementById('modalTitle').textContent;
    const theaterNumber = document.getElementById('modalTheatre').textContent.split(': ')[1];

    // Redirect to the get tickets page with the movie title and theater number as query parameters
    window.location.href = `/get-tickets?title=${encodeURIComponent(movieTitle)}&theatre=${encodeURIComponent(theaterNumber)}`;
}

// Ticket prices
const prices = {
    adult: 11.99,
    child: 8.99,
    senior: 9.99
};

// Ticket counts
let ticketCounts = {
    adult: 0,
    child: 0,
    senior: 0
};

// Update ticket counts and total price
function adjustQuantity(type, amount) {
    // Update count for the specified ticket type
    ticketCounts[type] = Math.max(0, ticketCounts[type] + amount);
    
    // Update the displayed count for this ticket type
    document.getElementById(`${type}Count`).innerText = ticketCounts[type];

    // Calculate totals
    updateTotals();
}

// Calculate and update total tickets and price
function updateTotals() {
    const totalTickets = ticketCounts.adult + ticketCounts.child + ticketCounts.senior;
    const totalPrice = (ticketCounts.adult * prices.adult) + (ticketCounts.child * prices.child) + (ticketCounts.senior * prices.senior);

    // Update displayed totals
    document.getElementById("totalTickets").innerText = totalTickets;
    document.getElementById("totalPrice").innerText = totalPrice.toFixed(2);
}

// Confirm selection and show warning if no tickets are selected
function confirmSelection() {
    const totalTickets = ticketCounts.adult + ticketCounts.child + ticketCounts.senior;
    const warningMessage = document.getElementById("warningMessage");

    if (totalTickets > 0) {
        warningMessage.style.display = "none";
        openShowtimeSelection(totalTickets); // Pass totalTickets as an argument
    } else {
        warningMessage.style.display = "block";
    }
}

// Open the showtime selection screen
async function openShowtimeSelection() {
    document.getElementById("ticketSelectionModal").style.display = "none";
    document.getElementById("showtimeSelection").style.display = "block";

    // Retrieve and log theater number
    const theaterNumberElement = document.getElementById('modalTheatre');
    if (!theaterNumberElement) {
        console.error("modalTheatre element not found.");
        return;
    }

    const theaterNumber = parseInt(theaterNumberElement.textContent.split(': ')[1], 10);
    console.log("Theater Number:", theaterNumber);

    // Fetch the data and log it
    const theaters = await fetchShowtimeData();
    console.log("Fetched Theaters Data:", theaters);

    const showtimeContainer = document.getElementById("showtimeContainer");
    showtimeContainer.innerHTML = ""; // Clear previous showtimes

    // Find the selected theater by matching with theaterNumber
    const selectedTheater = theaters.find(theater => theater.theater_id === theaterNumber);
    console.log("Selected Theater:", selectedTheater);

    if (selectedTheater) {
        selectedTheater.showtimes.forEach(showtime => {
            const showtimeButton = document.createElement("button");
            showtimeButton.className = "showtimeButton";
            showtimeButton.innerText = `${showtime.movie_title} - ${new Date(showtime.start_time).toLocaleString()}`;
            showtimeButton.onclick = () => selectShowtime(showtime);
            showtimeContainer.appendChild(showtimeButton);
        });
    } else {
        console.log("No showtimes found for the selected theater.");
    }
}

//back to ticket selection
function goBackToTicketSelection() {
    document.getElementById("showtimeSelection").style.display = "none";
    document.getElementById("ticketSelectionModal").style.display = "block";
}


function selectShowtime(showtime) {
    console.log("Selected showtime:", showtime);
    openSeatSelection(showtime.showtime_id); // Pass the showtime ID
}


let selectedSeats = [];

async function openSeatSelection(showtimeId) {
    document.getElementById("showtimeSelection").style.display = "none";
    document.getElementById("seatSelection").style.display = "block";

    const theaterNumber = parseInt(document.getElementById('modalTheatre').textContent.split(': ')[1], 10);
    const theaters = await fetchShowtimeData();
    const selectedTheater = theaters.find(theater => theater.theater_id === theaterNumber);
    const showtime = selectedTheater.showtimes.find(s => s.showtime_id === showtimeId);

    totalTickets = ticketCounts.adult + ticketCounts.child + ticketCounts.senior;
    selectedSeats = [];

    const seatContainer = document.getElementById("seatContainer");
    seatContainer.innerHTML = "";

    // Create seat grid
    showtime.seats.forEach((seat, index) => {
        const seatButton = document.createElement("button");
        seatButton.className = seat.is_available ? "seat available" : "seat taken";
        seatButton.textContent = `${seat.row}${seat.number}`;
        seatButton.disabled = !seat.is_available;

        // Handle seat selection
        seatButton.onclick = () => toggleSeatSelection(seatButton, seat);

        seatContainer.appendChild(seatButton);

        // Add a line break after each row (10 rows, 16 seats per row)
        if ((index + 1) % 16 === 0) {
            seatContainer.appendChild(document.createElement("br"));
        }
    });
}

function toggleSeatSelection(button, seat) {
    if (selectedSeats.length < totalTickets || button.classList.contains("selected")) {
        if (button.classList.contains("selected")) {
            button.classList.remove("selected");
            button.style.backgroundColor = "blue";
            selectedSeats = selectedSeats.filter(s => s.row !== seat.row || s.number !== seat.number);
        } else {
            button.classList.add("selected");
            button.style.backgroundColor = "green";
            selectedSeats.push(seat);
        }
    }

    // Check if exact number of tickets are selected
    if (selectedSeats.length === totalTickets) {
        console.log("All seats selected. Proceed to confirmation.");
        // Add your proceed-to-confirmation logic here
    }
}

function goBackToShowtimeSelection() {
    document.getElementById("seatSelection").style.display = "none";
    document.getElementById("showtimeSelection").style.display = "block";
}

