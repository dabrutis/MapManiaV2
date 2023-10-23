var gmap;
var currentMarker = null;
var currentLocationIndex = 0;
var favoritePlaces;

fetch('https://dabrutis.github.io/MapManiaAPI/FavoritePlaces.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log(data);

    favoritePlaces = data.map(item => ({
      content: item.content,
      coordinates: {
        lat: item.coordinates.lat,
        lng: item.coordinates.lng
      }
    }));
    initMap();
  })
  .catch(error => {
    console.error('Error fetching JSON data:', error);
  });

function initMap() {

  const myLatlng = { lat: 30, lng: -90 };

  gmap = new google.maps.Map(document.getElementById('myMapID'), {
    center: myLatlng,
    zoom: 4
  });

  google.maps.event.addListener(gmap, 'idle', function () {
    console.log("Bounds Changed");
    console.log("Current Zoom Level: " + gmap.getZoom());
  });

  gmap.addListener("click", (e) => {
    const clickedLatLng = e.latLng;

    // Check if we have more locations to check
    if (currentLocationIndex < favoritePlaces.length) {
      const currentLocation = favoritePlaces[currentLocationIndex];
      const currentLatLng = new google.maps.LatLng(currentLocation.coordinates.lat, currentLocation.coordinates.lng);
      const distanceToCurrentLocation = haversineDistance(clickedLatLng, currentLatLng);

      document.getElementById("distanceDisplay").innerHTML = "Distance to Target: " + distanceToCurrentLocation.toFixed(2) + "km";

      // Define a threshold for what is considered close enough
      const threshold = 50;

      // Check if the location is within the map bounds
      if (gmap.getBounds().contains(currentLatLng)) {
        if (distanceToCurrentLocation <= threshold) {
          // You can perform actions for the close location here if needed
          alert(`You found the location: ${currentLocation.content}`);

          // Move to the next location
          currentLocationIndex++;
          if (currentLocationIndex < favoritePlaces.length) {
            const nextLocation = favoritePlaces[currentLocationIndex];
            const nextLatLng = new google.maps.LatLng(nextLocation.coordinates.lat, nextLocation.coordinates.lng);
          }
        }
      }
    }
  });
}

// Function to calculate the Haversine distance between two points
function haversineDistance(point1, point2) {
  const R = 6371; // Radius of the Earth in kilometers
  const lat1 = point1.lat();
  const lng1 = point1.lng();
  const lat2 = point2.lat();
  const lng2 = point2.lng();

  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

window.initMap = initMap;