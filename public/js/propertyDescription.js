const API_KEY = 'AIzaSyDY0zEGiZRJ6kmm79kgqTkxuGnkXgJ0zhg';
        const address = 'Nanyang Polytechnic';

        const encodedAddress = encodeURIComponent(address);

        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${API_KEY}`;

        fetch(url)
          .then(response => response.json())
          .then(data => {
            if (data.status === 'OK') {
              // Extract latitude and longitude from the response
              const location = data.results[0].geometry.location;
              const latitude = location.lat;
              const longitude = location.lng;

              // Log the latitude and longitude
              console.log('Latitude:', latitude);
              console.log('Longitude:', longitude);

              // Initialize the map and add the marker
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
            title: 'Nanyang Polytechnic',
            icon: {
              url: "../images/map-marker.png",
              scaledSize: new google.maps.Size(38, 38)
            },
            animation: google.maps.Animation.DROP
          });

          const infowindow = new google.maps.InfoWindow({
            content: 'Nanyang Polytechnic'
          });

          marker.addListener("click", () => {
            infowindow.open(map, marker);
          });
        }