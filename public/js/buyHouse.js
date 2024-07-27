document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const propertiesContainer = document.querySelector('.properties-container');

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();

        // Get all property items
        const propertyItems = propertiesContainer.querySelectorAll('.buyitem');

        propertyItems.forEach(item => {
            const address = item.querySelector('.propertyaddress').textContent.toLowerCase();

            // Show or hide property items based on the search term
            if (address.includes(searchTerm) || searchTerm === '') {
                item.style.display = 'block'; // Show property
            } else {
                item.style.display = 'none'; // Hide property
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', (event) => {
    const modal = document.getElementById('filterModal');
    const filterButton = document.querySelector('.filter-icon');
    const closeButton = document.querySelector('.close-button');

    filterButton.addEventListener('click', (event) => {
        event.preventDefault();
        modal.style.display = 'block';
    });

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    // Prevent form submission
    const form = modal.querySelector('form');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        // Add form submission logic here (e.g., AJAX call)
        modal.style.display = 'none'; // Close modal after handling the form data
    });
    
    // Prevent clicks inside the modal from propagating to the window click listener
    modal.querySelector('.modal-content').addEventListener('click', (event) => {
        event.stopPropagation();
    });
});