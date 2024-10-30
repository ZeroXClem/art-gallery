// Section: Gallery Setup

/**
 * Fetch painting data from an external JSON file.
 * This allows for easier updates and scalability.
 */
async function fetchPaintings() {
    try {
        const response = await fetch('paintings.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.paintings;
    } catch (error) {
        console.error('Failed to fetch painting data:', error);
        return [];
    }
}

/**
 * Initialize the gallery by fetching data and rendering paintings.
 */
async function initGallery() {
    const paintingsData = await fetchPaintings();
    if (paintingsData.length === 0) {
        const gallery = document.getElementById('gallery');
        gallery.innerHTML = '<p>Failed to load paintings. Please try again later.</p>';
        return;
    }

    // Populate artist filter options dynamically
    populateArtistFilter(paintingsData);

    // Initialize global paintings array
    window.paintings = paintingsData;

    // Render the gallery
    renderGallery();
}

/**
 * Populate the artist filter dropdown with unique artist names.
 * @param {Array} paintingsData - Array of painting objects.
 */
function populateArtistFilter(paintingsData) {
    const artistFilter = document.getElementById('artistFilter');
    const artists = [...new Set(paintingsData.map(painting => painting.artist))];

    artists.forEach(artist => {
        const option = document.createElement('option');
        option.value = artist;
        option.textContent = artist;
        artistFilter.appendChild(option);
    });
}

/**
 * Create a painting element to be displayed in the gallery.
 * @param {Object} painting - Painting object containing details.
 * @returns {HTMLElement} - The DOM element representing the painting.
 */
function createPaintingElement(painting) {
    const paintingDiv = document.createElement('div');
    paintingDiv.classList.add('painting');
    paintingDiv.setAttribute('role', 'button');
    paintingDiv.setAttribute('tabindex', '0');
    paintingDiv.setAttribute('aria-label', `Click to learn more about ${painting.title}`);

    // Create and append the image
    const img = document.createElement('img');
    img.src = painting.imagePath;
    img.alt = painting.title;
    img.loading = "lazy";
    paintingDiv.appendChild(img);

    // Create and append the title
    const title = document.createElement('h2');
    title.classList.add('title');
    title.textContent = painting.title;
    paintingDiv.appendChild(title);

    // Create and append the artist name
    const artist = document.createElement('p');
    artist.classList.add('artist');
    artist.textContent = `Artist: ${painting.artist}`;
    paintingDiv.appendChild(artist);

    // Create and append the description
    const desc = document.createElement('p');
    desc.classList.add('description');
    desc.textContent = painting.description;
    paintingDiv.appendChild(desc);

    // If there's a special note, add it
    if (painting.specialNote) {
        const note = document.createElement('p');
        note.classList.add('special-note');
        note.textContent = painting.specialNote;
        paintingDiv.appendChild(note);
    }

    // Event Handling: Open modal on click or keypress
    paintingDiv.addEventListener('click', () => {
        openModal(painting);
    });

    paintingDiv.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            openModal(painting);
        }
    });

    return paintingDiv;
}

/**
 * Render the gallery based on the current paintings array.
 */
function renderGallery() {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; // Clear existing content

    // Iterate through each painting and append to gallery
    paintings.forEach(painting => {
        const paintingElement = createPaintingElement(painting);
        gallery.appendChild(paintingElement);
    });
}

/**
 * Open the modal and display painting details.
 * @param {Object} painting - Painting object containing details.
 */
function openModal(painting) {
    const modal = document.getElementById('myModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalImage = document.getElementById('modalImage');
    const modalArtist = document.querySelector('.modal-content .artist');
    const modalDescription = document.querySelector('.modal-content .description');
    const modalNote = document.querySelector('.modal-content .special-note');

    // Populate modal content
    modalTitle.textContent = painting.title;
    modalImage.src = painting.imagePath;
    modalImage.alt = painting.title;
    modalArtist.textContent = `Artist: ${painting.artist}`;
    modalDescription.textContent = painting.description;
    modalNote.textContent = painting.specialNote;

    // Show the modal with animation
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
}

/**
 * Close the modal and clear its content.
 */
function closeModal() {
    const modal = document.getElementById('myModal');
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
}

// Event Listener for closing the modal
document.querySelector('.close').addEventListener('click', closeModal);

// Close modal when clicking outside the modal content
window.addEventListener('click', (event) => {
    const modal = document.getElementById('myModal');
    if (event.target === modal) {
        closeModal();
    }
});

// Accessibility: Close modal with Escape key
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeModal();
    }
});

// Section: Sorting and Filtering

/**
 * Filter paintings by selected artist.
 * @param {String} artist - The artist name to filter by.
 */
function filterPaintings(artist) {
    if (artist === 'all') {
        // Reset to all paintings
        paintings = window.allPaintings;
    } else {
        // Filter paintings by artist
        paintings = window.allPaintings.filter(painting => painting.artist === artist);
    }
    renderGallery();
}

/**
 * Sort paintings based on the selected option.
 * @param {String} option - The sorting criterion.
 */
function sortPaintings(option) {
    if (option === 'alphabetical') {
        paintings.sort((a, b) => a.title.localeCompare(b.title));
    } else if (option === 'date') {
        paintings.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    // Additional sort options can be implemented here
    renderGallery();
}

/**
 * Initialize event listeners for sorting and filtering controls.
 */
function initControls() {
    // Artist Filter Event Listener
    document.getElementById('artistFilter').addEventListener('change', (e) => {
        filterPaintings(e.target.value);
    });

    // Sort Option Event Listener
    document.getElementById('sortOption').addEventListener('change', (e) => {
        sortPaintings(e.target.value);
    });
}

// Initialize the gallery and controls on page load
document.addEventListener('DOMContentLoaded', async () => {
    const allPaintings = await fetchPaintings();
    window.allPaintings = allPaintings; // Store all paintings globally for filtering
    window.paintings = [...allPaintings]; // Initialize current paintings array
    populateArtistFilter(allPaintings);
    renderGallery();
    initControls();
});