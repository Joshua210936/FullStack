const API_KEY = 'AIzaSyDY0zEGiZRJ6kmm79kgqTkxuGnkXgJ0zhg';
const address = propertyDetail.Property_Address;

const encodedAddress = encodeURIComponent(address);

const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${API_KEY}`;

let map; // Variable to store the map instance
let originalMarker; // Variable to store the original marker instance
let newMarker; // Variable to store the new marker instance
let directionsService; // Variable to store the directions service instance
let directionsRenderer; // Variable to store the directions renderer instance

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
        originalMarker = null; // Clear the marker instance
        document.getElementById('map').innerHTML = ''; // Clear the map container
    }

    // Initialize a new map instance
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: latitude, lng: longitude },
        zoom: 16,
        mapId: mapId
    });

    // Initialize the directions service and renderer
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true // Suppress the default A and B markers
    });
    directionsRenderer.setMap(map);

    // Create the original marker
    originalMarker = new google.maps.Marker({
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

    originalMarker.addListener("click", () => {
        infowindow.open(map, originalMarker);
    });
}

// Event listener for filter buttons
document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => {
        const newMapId = button.getAttribute('data-map-id');
        if (map) {
            const center = originalMarker.getPosition();
            // Reinitialize the map with the new map ID
            initMap(center.lat(), center.lng(), newMapId);
        } else {
            console.log("Map is not initialized yet.");
        }
    });
});

// Event listener for address input
document.getElementById('addresstext').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        const newAddress = this.value;
        const encodedNewAddress = encodeURIComponent(newAddress);
        const newUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedNewAddress}&key=${API_KEY}`;

        fetch(newUrl)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'OK') {
                    const location = data.results[0].geometry.location;
                    const newLatitude = location.lat;
                    const newLongitude = location.lng;

                    console.log('New Latitude:', newLatitude);
                    console.log('New Longitude:', newLongitude);

                    // Remove the existing new marker if it exists
                    if (newMarker) {
                        newMarker.setMap(null);
                    }

                    // Add a new marker at the new coordinates
                    newMarker = new google.maps.Marker({
                        position: { lat: newLatitude, lng: newLongitude },
                        map,
                        title: newAddress,
                        icon: {
                            url: "../images/new-marker.png",
                            scaledSize: new google.maps.Size(48, 50)
                        },
                        animation: google.maps.Animation.DROP
                    });

                    const newInfowindow = new google.maps.InfoWindow({
                        content: newAddress
                    });

                    newMarker.addListener("click", () => {
                        newInfowindow.open(map, newMarker);
                    });

                    // Draw a path between the original marker and the new marker
                    const request = {
                        origin: originalMarker.getPosition(),
                        destination: newMarker.getPosition(),
                        travelMode: google.maps.TravelMode.DRIVING
                    };

                    directionsService.route(request, (result, status) => {
                        if (status === google.maps.DirectionsStatus.OK) {
                            directionsRenderer.setDirections(result);

                            // Display the estimated travel time
                            const travelTime = result.routes[0].legs[0].duration.text;
                            const travelTimeElement = document.getElementById('traveltime');
                            travelTimeElement.innerText = `Estimated Travel Time (By Car): ${travelTime}`;
                            travelTimeElement.style.display = 'block'; 
                        } else {
                            console.error('Directions request failed due to ' + status);
                        }
                    });
                } else {
                    console.error('Geocoding error:', data.status);
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }
});

// Add active class toggle for filter buttons
document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', function() {
        // Remove active class from all buttons
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));

        // Add active class to the clicked button
        this.classList.add('active');
    });
});