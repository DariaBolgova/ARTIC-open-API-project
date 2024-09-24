document.getElementById('artist-button').addEventListener('click', () => {

    document.getElementById('picture').innerHTML = '';

    const searchResult = document.getElementById('search-result');
    searchResult.classList.remove('hidden');

    fetch('https://api.artic.edu/api/v1/artists')

        .then(response => response.json())

        .then(data => {
            const totalPages = data.pagination.total_pages;
            const limit = data.pagination.limit;
            
            const randomPage = Math.floor(Math.random() * totalPages) + 1;

            return fetch(`https://api.artic.edu/api/v1/artists?page=${randomPage}&limit=${limit}`);
        })

        .then(response => response.json())

        .then(data => {
            const artistsOnPage = data.data;
            let randomArtistIndex = Math.floor(Math.random() * artistsOnPage.length);
            let randomArtist = artistsOnPage[randomArtistIndex];
            
            return checkArtistWorks(randomArtist);
        })
        .catch(error => {
            console.error("Oops, there is an error: ", error, " Let's try again?");
        });
});

function checkArtistWorks(artist) {

    const artistId = artist.id;
    return fetch(`https://api.artic.edu/api/v1/artworks/search?query[term][artist_ids]=${artistId}`)

        .then(response => response.json())

        .then(data => {
            const availableWorks = data.data.filter(work => checkWorkAvailability(work.id));

            if (availableWorks.length > 0) {
                
                displayAuthor(artist);

                const authorSection = document.getElementById('search-result');
                const authorHeading = authorSection.querySelector('h2');

                let existingInstruction = authorSection.querySelector('.instruction');
                if (existingInstruction) {
                    existingInstruction.remove();
                }

                const instructionParagraph = document.createElement('p');
                instructionParagraph.textContent = 'Select a work from the list below and click on its title to see its image:';
                instructionParagraph.classList.add('instruction');
                authorHeading.insertAdjacentElement('afterend', instructionParagraph);

                displayWorks(availableWorks);

            } else {
                console.log("Sorry, the artist's works were not found. Choosing another artist...");
                document.getElementById('search-result').classList.add('hidden');
            }
        })

        .catch(error => {
            console.error("Sorry, there is an error loading the author's work:", error);
        });
}

function checkWorkAvailability(workId) {
    return fetch(`https://api.artic.edu/api/v1/artworks/${workId}`)
        .then(response => {
            return response.ok;
        })
        .catch(error => {
            console.error("Sorry, there is an error loading the author's work:", error);
            return false;
        });
}

function displayAuthor(author) {
    const authorSection = document.getElementById('search-result').querySelector('h2');
    authorSection.textContent = `Artist: ${author.title}`;
}

function displayWorks(works) {
    const worksList = document.getElementById('list-of-works');
    worksList.innerHTML = '';

    works.forEach(work => {
        const workItem = document.createElement('div');
        workItem.textContent = work.title;
        workItem.style.cursor = 'pointer';
        workItem.addEventListener('click', () => displayPicture(work.id));
        worksList.appendChild(workItem);
    });
}

function displayPicture(workId) {
    fetch(`https://api.artic.edu/api/v1/artworks/${workId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Sorry, there is an error loading the art's data");
            }
            return response.json();
        })
        .then(data => {
            const imageId = data.data.image_id;
            if (!imageId) {
                throw new Error("Sorry, the art was not found");
            }
            const imageUrl = `https://www.artic.edu/iiif/2/${imageId}/full/843,/0/default.jpg`;
            
            const pictureDiv = document.getElementById('picture');
            pictureDiv.innerHTML = '';
            const imgElement = document.createElement('img');
            imgElement.src = imageUrl;
            imgElement.alt = data.data.title;
            imgElement.style.maxWidth = '100%';
            pictureDiv.appendChild(imgElement);
        })
        .catch(error => {
            console.error("Sorry, there is an error loading the art's image:", error);
            const pictureDiv = document.getElementById('picture');
            pictureDiv.innerHTML = `<p>Sorry, there is an error loading the art's image</p>`;
        });
}
