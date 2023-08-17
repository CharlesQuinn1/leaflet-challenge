// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2023-07-31&endtime=2023-08-16&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // send the data.features object to the createFeatures function.
  createFeatures(data);
});

function createFeatures(earthquakeData) {

function chooseColor(mag) {
    if (mag >= 0.14) return "#ff5f65";
    else if (mag >= 0.09) return "#fca35d";
    else if (mag >= 0.06) return "#fdb72a";
    else if (mag >= 0.04) return "#f7db11";
    else if (mag >= 0.02) return "#dcf400";
    else if (mag >= 0.0) return "#a3f600";
    else return "black";
}

coords = [];

// function runs once for each feature in the features array.
// Creates a popup that describes the place and time of the earthquake.
function onEachFeature(feature, layer) {

    coords.push(
    L.circleMarker([feature.geometry.coordinates[1],feature.geometry.coordinates[0]], {
        stroke: true,
        weight: .6,
        color: "black",
        fillColor: chooseColor(feature.properties.dmin),
        fillOpacity: 0.9,
        opacity: 0.9,
        radius: feature.properties.mag*3
      }).bindPopup(`<b>${feature.properties.place}<b/><hr><p>
                <b>Magnitude:<b/> ${feature.properties.mag.toLocaleString('en-US', {minimumFractionDigits: 1, useGrouping: false})}<br>
                <b>Depth:<b/> ${(feature.properties.dmin*69.069).toLocaleString('en-US', {minimumFractionDigits: 1, useGrouping: false})} miles</p>`));
  }
  
  // Creates a GeoJSON layer containing the features array on the earthquakeData object.
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature
  });

  earthquakes = L.layerGroup(coords);

  // Send earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });


  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [35.691544, -105.944183],
    zoom: 6,
    layers: [street, earthquakes]
  });

  function getColor(d) {
    return d > 9 ? "#ff5f65" :
           d > 6  ? "#fca35d" :
           d > 4  ? "#fdb72a" :
           d > 2  ? "#f7db11" :
           d > 1   ? "#dcf400" :
           d > 0   ? "#a3f600" :
                       '#FFEDA0';
  }
  let legend = L.control({
      position: 'bottomright'
  });

  legend.onAdd = function (map) {
  
      let div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 4, 6, 9],
        labels = ['<strong>&nbspLEGEND&nbsp</strong><br>&nbspIn Miles&nbsp'],
        from, to;

      for (var i = 0; i < grades.length; i++) {
          from = grades [i];
          to = grades[i+1];

      labels.push(
          '<i style="background:' + getColor(from + 1) + '"></i> ' +
           (to ? to : '+') + '&nbsp&ndash;&nbsp' + from);
          }
          div.innerHTML = labels.join('<br>');
          return div;    
  
      // return div;
  };
  
  legend.addTo(myMap);

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

}
