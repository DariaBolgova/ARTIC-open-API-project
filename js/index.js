// Adding a click event listener to the 'artist-button' element
document.getElementById('artist-button').addEventListener('click', () => {

    // Clears the 'picture' element content when the button is clicked
    document.getElementById('picture').innerHTML = '';

    // Gets the 'search-result' section and removes the 'hidden' class to make it visible
    const searchResult = document.getElementById('search-result');
    searchResult.classList.remove('hidden');

    // Fetches a list of artists from the Art Institute of Chicago's API
    fetch('https://api.artic.edu/api/v1/artists')

        // Converts the response to JSON format
        .then(response => response.json())

        .then(data => {
            // Accesses data for total pages number and limit per page
            const totalPages = data.pagination.total_pages;
            const limit = data.pagination.limit;
            
            // Selects a random page to fetch artists from
            const randomPage = Math.floor(Math.random() * totalPages) + 1;

            // Fetches the artists data from the randomly selected page
            return fetch(`https://api.artic.edu/api/v1/artists?page=${randomPage}&limit=${limit}`);
        })

        // Converts the response to JSON format
        .then(response => response.json())

        .then(data => {
            // Selects a random artist from the fetched list of artists
            const artistsOnPage = data.data;
            let randomArtistIndex = Math.floor(Math.random() * artistsOnPage.length);
            let randomArtist = artistsOnPage[randomArtistIndex];
            
            // Checks for available works by the selected artist
            return checkArtistWorks(randomArtist);
        })
        .catch(error => {
            // Logs an error message if something goes wrong during the API requests
            console.error("Oops, there is an error: ", error, " Let's try again?");
        });
});

// Function to check if there are available works by the selected artist
function checkArtistWorks(artist) {

    const artistId = artist.id;
    // Fetches the list of artworks by the artist using their ID
    return fetch(`https://api.artic.edu/api/v1/artworks/search?query[term][artist_ids]=${artistId}`)

        .then(response => response.json())
        // Converts the response to JSON format

        .then(data => {
            // Filters the artworks to include only those that are available
            const availableWorks = data.data.filter(work => checkWorkAvailability(work.id));

            if (availableWorks.length > 0) {
                // If there are available works, display the artist's information and works
                displayAuthor(artist);

                // Accesses the 'search-result' section and its 'h2' element
                const authorSection = document.getElementById('search-result');
                const authorHeading = authorSection.querySelector('h2');

                // Removes any existing instruction paragraph if present
                let existingInstruction = authorSection.querySelector('.instruction');
                if (existingInstruction) {
                    existingInstruction.remove();
                }

                // Creates and adds a new instruction paragraph below the artist's name
                const instructionParagraph = document.createElement('p');
                instructionParagraph.textContent = 'Select a work from the list below and click on its title to see its image:';
                instructionParagraph.classList.add('instruction');
                authorHeading.insertAdjacentElement('afterend', instructionParagraph);

                // Displays the list of available works by the artist
                displayWorks(availableWorks);

            } else {
                // If no works are available, hides the 'search-result' section and logs a message
                console.log("Sorry, the artist's works were not found. Choosing another artist...");
                document.getElementById('search-result').classList.add('hidden');
            }
        })

        .catch(error => {
            // Logs an error message if there is an issue loading the artist's works
            console.error("Sorry, there is an error loading the author's work:", error);
        });
}

// Function to check if a specific work is available by fetching its details
function checkWorkAvailability(workId) {
    return fetch(`https://api.artic.edu/api/v1/artworks/${workId}`)
        .then(response => {
            return response.ok;
            // Returns true if the response is successful, otherwise false
        })
        .catch(error => {
            // Logs an error message if there is an issue with the artwork request
            console.error("Sorry, there is an error loading the author's work:", error);
            return false;
        });
}

// Function to display the selected artist's name
function displayAuthor(author) {
    const authorSection = document.getElementById('search-result').querySelector('h2');
    authorSection.textContent = `Artist: ${author.title}`;
    // Updates the content of the 'h2' element in the 'search-result' section to show the artist's name
}

// Function to display the list of available works by the artist
function displayWorks(works) {
    const worksList = document.getElementById('list-of-works');
    worksList.innerHTML = '';
    // Clears any existing content in the 'list-of-works' div

    works.forEach(work => {
        // Iterates through each work and creates a clickable div element for each
        const workItem = document.createElement('div');
        workItem.textContent = work.title;
        workItem.style.cursor = 'pointer';
        // Sets the text content to the work's title and changes the cursor to indicate interactivity

        workItem.addEventListener('click', () => displayPicture(work.id));
        // Adds a click event listener to show the work's image when clicked

        worksList.appendChild(workItem);
        // Adds the work item to the list of works
    });
}

// Function to display the image of a selected artwork
function displayPicture(workId) {
    fetch(`https://api.artic.edu/api/v1/artworks/${workId}`)
        .then(response => {
            if (!response.ok) {
                // If the response is not successful, throws an error
                throw new Error("Sorry, there is an error loading the art's data");
            }
            return response.json();
            // Converts the response to JSON format
        })
        .then(data => {
            const imageId = data.data.image_id;
            // Gets the image ID from the artwork data

            if (!imageId) {
                // If no image ID is found, throws an error
                throw new Error("Sorry, the art was not found");
            }

            // Constructs the URL for the artwork image using the image ID
            const imageUrl = `https://www.artic.edu/iiif/2/${imageId}/full/843,/0/default.jpg`;
            
            const pictureDiv = document.getElementById('picture');
            pictureDiv.innerHTML = '';
            // Clears any existing content in the 'picture' div

            const imgElement = document.createElement('img');
            imgElement.src = imageUrl;
            imgElement.alt = data.data.title;
            imgElement.style.maxWidth = '100%';
            // Creates an 'img' element, sets its source to the image URL, and styles it

            pictureDiv.appendChild(imgElement);
            // Adds the image element to the 'picture' div
        })
        .catch(error => {
            // Logs an error message if there is an issue loading the artwork image
            console.error("Sorry, there is an error loading the art's image:", error);

            // Displays an error message in the 'picture' div
            const pictureDiv = document.getElementById('picture');
            pictureDiv.innerHTML = `<p>Sorry, there is an error loading the art's image</p>`;
        });
}
