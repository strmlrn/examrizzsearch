document.addEventListener('DOMContentLoaded', function() {
    // ... (keep all the existing code until the performSearch function)

    function performSearch() {
        const query = searchInput.value;
        resultsDiv.innerHTML = 'Searching...';

        addToRecentSearches(query);

        // Update this URL to your new backend URL
        fetch(`https://35.195.0.126.com/api/search?q=${encodeURIComponent(query)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(results => {
                displayResults(results);
            })
            .catch(error => {
                console.error('Error:', error);
                resultsDiv.innerHTML = `<p>An error occurred while searching. Please try again later.</p>`;
            });
    }

    function displayResults(results) {
        resultsDiv.innerHTML = '';
        if (results.length === 0) {
            resultsDiv.innerHTML = '<p>No results found.</p>';
            return;
        }
        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.innerHTML = `
                <h2>${result.title || 'No Title'}</h2>
                <p>${result.content ? result.content.substring(0, 150) + '...' : 'No content available'}</p>
            `;

            // Update these conditions based on your MongoDB document structure
            if (result.file_type === 'image') {
                resultItem.innerHTML += `<img src="${result.file_path}" alt="${result.title || 'Image'}">`;
            } else if (result.file_type === 'video') {
                resultItem.innerHTML += `<video src="${result.file_path}" controls></video>`;
            } else if (result.file_type === 'pdf') {
                resultItem.innerHTML += `<a href="${result.file_path}" target="_blank">View PDF</a>`;
            }

            resultsDiv.appendChild(resultItem);
        });
    }
});
