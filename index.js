var gmap;
var currentMarker = null;
var currentLocationIndex = 0;
var favoritePlaces;
var score = 0;

alert("Welcome to David's Map Mania, click on the map to find my favorite places, and use the distance away from target to see which clicks get you closer. Find all 8 of my favorite places to win the game! (Double click on the score field to instantly win)");

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

      document.getElementById("distanceDisplay").innerHTML = "Hint: You are " + distanceToCurrentLocation.toFixed(2) + " km away from target";

      // Define a threshold for what is considered close enough
      const threshold = 50;

      // Check if the location is within the map bounds
      if (gmap.getBounds().contains(currentLatLng)) {
        if (distanceToCurrentLocation <= threshold) {
          // You found the location: Increment the score
          score++;
          alert(`You found the location: ${currentLocation.content}. Move onto the next location!`);

          document.getElementById("scoreDisplay").innerHTML = `Score: ${score}/8`;
          
          // Check if all locations have been found
          if (score === favoritePlaces.length) {
            alert("Congratulations! You've found all 8 locations. You win!");

            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            });
          }

          currentLocationIndex++;
          if (currentLocationIndex < favoritePlaces.length) {
            const nextLocation = favoritePlaces[currentLocationIndex];
            const nextLatLng = new google.maps.LatLng(nextLocation.coordinates.lat, nextLocation.coordinates.lng);
          }
        }
      }
    }
  });

  // Add a double-click event listener on the score field
  const scoreDisplay = document.getElementById("scoreDisplay");

  scoreDisplay.addEventListener("dblclick", () => {
      const isCheating = window.confirm("Do you want to activate the cheat code and instantly win the game?");
      if (isCheating) {
        score = favoritePlaces.length;
        document.getElementById("scoreDisplay").innerHTML = `Score: ${score}/8`;
        alert("Cheat code activated! You've instantly won the game.");
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
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