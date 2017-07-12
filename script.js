// Constants
var url = 'foss4g_locations.geojson'
var request = new XMLHttpRequest();
mapboxgl.accessToken = 'pk.eyJ1IjoiZXhhbXBsZXMiLCJhIjoiY2lqbmpqazdlMDBsdnRva284cWd3bm11byJ9.V6Hg2oYJwMAxeoR9GEzkAA';

// General function
if (!('remove' in Element.prototype)) {
  Element.prototype.remove = function() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  };
}


// handle navigation - FIXME
function navMe(lon,lat) {
  navigator.geolocation.getCurrentPosition(function(position) {
    //Send to Mapbox Directions page
    var navUrl = 'nav?start=' + position.coords.longitude + ',' + position.coords.latitude + '&end=' + lon + ',' + lat
    window.open(navUrl)
  });
}

// General location type lookup
var typeLookup = {
  "Conference Hotel": "lodging",
  "Main Conference Venue": "conference",
  "Workshops": "conference",
  "Harpoon Welcome Social": "social",
  "Gala": "social",
  "JS.Geo & Code Sprint": "conference",
  "South Station": "transit",
  "Harvard": "transit",
  "Red Line  (T)": "transit",
  "World Trade Center": "transit",
  "Courthouse": "transit",
  "Silver Line (T)": "transit",
  "Suggested Walk from Conference to Gala": "walk",
  "Boston Logan International Airport": "airport",
  "Renaissance Boston Waterfront Hotel": "lodging",
  "The Westin Boston Waterfront": "lodging",
  "Aloft Boston Seaport": "lodging",
  "Element Boston Seaport": "lodging",
  "The Envoy Hotel, Autograph Collection": "lodging",
  "YOTEL Boston": "lodging"
}


// AJAZZ:
request.open('GET', url, true);
request.onload = function() {
  if (request.status >= 200 && request.status < 400) {
    // sort points from lines
    var sites = JSON.parse(request.responseText);
    var points = { "type": "FeatureCollection", "features": [] }
    var lines = { "type": "FeatureCollection", "features": [] }
    
    for (var s = 0; s < sites.features.length; s++) {
      if (sites.features[s].geometry.type === 'Point') {
        points.features.push(sites.features[s])
      } else {
        lines.features.push(sites.features[s])
      }
    }
    
    // This adds the map
    var map = new mapboxgl.Map({
      // container id specified in the HTML
      container: 'map',
      // style URL
      style: 'mapbox://styles/mapbox/dark-v9',
      // initial position in [long, lat] format
      center: [-71.039601,42.349108],
      // initial zoom
      zoom: 14,
      pitch: 55
    });

    // This adds the data to the map
    map.on('load', function(e) {
      map.addSource("places", {
        "type": "geojson",
        "data": points
      });
      // Initialize the list
      buildLocationList(points);
      // Add line features
      
    });
    
    

    // This is where your interactions with the symbol layer used to be
    // Now you have interactions with DOM markers instead
    points.features.forEach(function(marker, i) {
      // Create an img element for the marker
      var el = document.createElement('div');
      el.id = "marker-" + i;
      el.style.left = '-18px';
      el.style.top = '-18px';
      el.className = 'marker ' + typeLookup[marker.properties.name];
      // Add markers to the map at all points
      new mapboxgl.Marker(el)
        .setLngLat(marker.geometry.coordinates)
        .addTo(map);

      el.addEventListener('click', function(e) {
        // 1. Fly to the point
        flyToStore(marker);

        // 2. Close all other popups and display popup for clicked store
        createPopUp(marker);

        // 3. Highlight listing in sidebar (and remove highlight for all other listings)
        var activeItem = document.getElementsByClassName('active');

        e.stopPropagation();
        if (activeItem[0]) {
          activeItem[0].classList.remove('active');
        }

        var listing = document.getElementById('listing-' + i);
        listing.classList.add('active');

      });
    });

    // add wacky movement because you're still not over all the 
    // 3d stuff available w/ GL
    function flyToStore(currentFeature) {
      map.flyTo({
        center: currentFeature.geometry.coordinates,
        zoom: 15,
        bearing: Math.floor(Math.random() * 50) + 1,
        pitch: Math.floor(Math.random() * 50) + 1,
        speed: 0.3,
        curve: 1
      });
    }

    function createPopUp(currentFeature) {
      var popUps = document.getElementsByClassName('mapboxgl-popup');
      if (popUps[0]) popUps[0].remove();

      var popupContent
      if (currentFeature.properties.description) {
        popupContent = '<h3>' + currentFeature.properties.name + '</h3>' + '<h4>' + currentFeature.properties.description + '</h4><p class="pad3"><a onclick="navMe(' + currentFeature.geometry.coordinates + ')" class="button">Navigate</a></p>'
      } else {
        popupContent = '<h3>' + currentFeature.properties.name + '</h3>'
      }
      var popup = new mapboxgl.Popup({
          closeOnClick: false
        })
        .setLngLat(currentFeature.geometry.coordinates)
        .setHTML(popupContent)
        .addTo(map);
    }

    function buildLocationList(data) {
      for (i = 0; i < data.features.length; i++) {
        var currentFeature = data.features[i];
        var prop = currentFeature.properties;

        var listings = document.getElementById('listings');
        var listing = listings.appendChild(document.createElement('div'));
        listing.className = 'item';
        listing.id = "listing-" + i;

        var link = listing.appendChild(document.createElement('a'));
        link.href = '#';
        link.className = 'title';
        link.dataPosition = i;
        link.innerHTML = prop.name;

        var details = listing.appendChild(document.createElement('div'));
        if (prop.description) {
          details.innerHTML = prop.description;
        }


        link.addEventListener('click', function(e) {
          // Update the currentFeature to the store associated with the clicked link
          var clickedListing = data.features[this.dataPosition];

          // 1. Fly to the point
          flyToStore(clickedListing);

          // 2. Close all other popups and display popup for clicked store
          createPopUp(clickedListing);

          // 3. Highlight listing in sidebar (and remove highlight for all other listings)
          var activeItem = document.getElementsByClassName('active');

          if (activeItem[0]) {
            activeItem[0].classList.remove('active');
          }
          this.parentNode.classList.add('active');

        });
      }
    }
  }
};
request.onerror = function() {
  console.log('connection error')
};
request.send();
