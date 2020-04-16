import * as L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.icon.glyph';

// https://wiki.openstreetmap.org/wiki/Tile_servers
var tiles = L.tileLayer('https://api.maptiler.com/maps/streets/256/{z}/{x}/{y}@2x.png?key=2YXRM0uTljQEY5Z3BxD8', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }),
  latlng = L.latLng(37.75877280300828, -122.41928100585939);

var mymap = L.map('map', {center: latlng, zoom: 13, layers: [tiles]});

// var markers = L.markerClusterGroup({
//   maxClusterRadius: 1
// });

var myHeaders = new Headers();
myHeaders.set('Content-Type','application/json')
var myInit = { method: 'GET',
              headers: myHeaders,
              mode: 'cors',
              cache: 'default' };

fetch('results.json',myInit)
.then(function(response) {
  var contentType = response.headers.get("content-type");
  if(contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  } else {
    console.log("Oops, nous n'avons pas du JSON!");
  }
})
.then(function(json) {
  // traitement du JSON
  json.forEach(dataRow => {
    if(dataRow.geodata && dataRow.geodata[0]) {
      var marker = L.marker([dataRow.geodata[0].lat, dataRow.geodata[0].lon], {
        // https://fontawesome.com/v4.7.0/icons/
          icon: L.icon.glyph({ 
            prefix: 'fa', 
            glyph: 'heart',
            glyphColor: '#000'
          })
        });
      const markup = `
        <h3>${dataRow['Site']['value']}</h3>
        <p>
          <strong>Landmark Status</strong><br/>
          ${dataRow['Landmark Status']['value'] ? dataRow['Landmark Status']['value'] : 'N/A'}<br/>
          <strong>Notes</strong><br/>
          ${dataRow['Notes']['value'] ? dataRow['Notes']['value'] : 'N/A'}<br/>
          <strong>Address</strong><br/>
          ${dataRow['geodata'][0]['display_name'] ? dataRow['geodata'][0]['display_name'] : ''}
        </p>
      `;
      marker.bindPopup(markup);
      marker.addTo(mymap);
      // markers.addLayer(marker)
    } else {
      console.log('no geodata', dataRow);
    }
  });
  // mymap.addLayer(markers);
});
