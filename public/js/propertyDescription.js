const API_KEY = 'AIzaSyDY0zEGiZRJ6kmm79kgqTkxuGnkXgJ0zhg';
const address = propertyDetail.Property_Address;

const encodedAddress = encodeURIComponent(address);

const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${API_KEY}`;

fetch(url)
    .then(response => response.json())
    .then(data => {
        if (data.status === 'OK') {
            const location = data.results[0].geometry.location;
            const latitude = location.lat;
            const longitude = location.lng;

            console.log('Latitude:', latitude);
            console.log('Longitude:', longitude);

            initMap(latitude, longitude);
        } else {
            console.error('Geocoding error:', data.status);
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

function initMap(latitude, longitude) {
    const map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: latitude, lng: longitude },
        zoom: 12,
        mapId: '7eb9cb155077df0'
    });

    const marker = new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map,
        title: propertyDetail.Property_Name,
        icon: {
            url: "../images/map-marker.png",
            scaledSize: new google.maps.Size(38, 38)
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