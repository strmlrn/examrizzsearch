document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const resultsDiv = document.getElementById('results');
    const welcomeMessage = document.getElementById('welcome-message');
    const recentSearchesList = document.getElementById('recent-searches');
    const viewAllSearchesButton = document.getElementById('view-all-searches');
    const modal = document.getElementById('recent-searches-modal');
    const closeModal = document.getElementsByClassName('close')[0];
    const allRecentSearchesList = document.getElementById('all-recent-searches');

    // Typing animation for welcome message
    const welcomeText = "Welcome to examrizzsearch!";
    let i = 0;

    function typeWriter() {
        if (i < welcomeText.length) {
            welcomeMessage.innerHTML += welcomeText.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        }
    }

    typeWriter();

    // Recent searches functionality
    let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];

    function updateRecentSearches() {
        recentSearchesList.innerHTML = '';
        const displaySearches = recentSearches.slice(0, 5);
        displaySearches.forEach(search => {
            const li = document.createElement('li');
            li.textContent = search;
            li.addEventListener('click', () => {
                searchInput.value = search;
                performSearch();
            });
            recentSearchesList.appendChild(li);
        });
    }

    function updateAllRecentSearches() {
        allRecentSearchesList.innerHTML = '';
        recentSearches.forEach(search => {
            const li = document.createElement('li');
            li.textContent = search;
            allRecentSearchesList.appendChild(li);
        });
    }

    function addToRecentSearches(query) {
        if (!recentSearches.includes(query)) {
            recentSearches.unshift(query);
            if (recentSearches.length > 20) {
                recentSearches.pop();
            }
            localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
            updateRecentSearches();
        }
    }

    updateRecentSearches();

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    viewAllSearchesButton.addEventListener('click', function() {
        updateAllRecentSearches();
        modal.style.display = "block";
    });

    closeModal.addEventListener('click', function() {
        modal.style.display = "none";
    });

    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });

    function performSearch() {
        const query = searchInput.value;
        resultsDiv.innerHTML = 'Searching...';

        addToRecentSearches(query);

     
     fetch(`http://YOUR_VM_IP:3000/api/search?q=${encodeURIComponent(query)}`)
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
