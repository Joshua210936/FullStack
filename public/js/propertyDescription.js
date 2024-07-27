const API_KEY = 'AIzaSyDY0zEGiZRJ6kmm79kgqTkxuGnkXgJ0zhg';
const address = propertyDetail.Property_Address;

const encodedAddress = encodeURIComponent(address);

const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${API_KEY}`;

let map; // Variable to store the map instance
let marker; // Variable to store the marker instance

fetch(url)
    .then(response => response.json())
    .then(data => {
        if (data.status === 'OK') {
            const location = data.results[0].geometry.location;
            const latitude = location.lat;
            const longitude = location.lng;

            console.log('Latitude:', latitude);
            console.log('Longitude:', longitude);

            initMap(latitude, longitude, '7eb9cb155077df0'); // Default map ID
        } else {
            console.error('Geocoding error:', data.status);
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

function initMap(latitude, longitude, mapId) {
    // Remove existing map and marker if they exist
    if (map) {
        map = null; // Clear the map instance
        marker = null; // Clear the marker instance
        document.getElementById('map').innerHTML = ''; // Clear the map container
    }

    // Initialize a new map instance
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: latitude, lng: longitude },
        zoom: 16,
        mapId: mapId
    });

    marker = new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map,
        title: propertyDetail.Property_Name,
        icon: {
            url: "../images/map-marker.png",
            scaledSize: new google.maps.Size(60, 60)
        },
        animation: google.maps.Animation.DROP
    });

    const infowindow = new google.maps.InfoWindow({
        content: propertyDetail.Property_Name
    });

    marker.addListener("click", () => {
        infowindow.open(map, marker);
    });
}

// Event listener for filter buttons
document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => {
        const newMapId = button.getAttribute('data-map-id');
        if (map) {
            const center = marker.getPosition();
            // Reinitialize the map with the new map ID
            initMap(center.lat(), center.lng(), newMapId);
        } else {
            console.log("Map is not initialized yet.");
        }
    });
});

document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', function() {
        // Remove active class from all buttons
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));

        // Add active class to the clicked button
        this.classList.add('active');
    });
});