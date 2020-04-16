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
  // console.log(json);
  
  json.forEach(dataRow => {
    if(dataRow.geodata && dataRow.geodata[0]) {
      let color = '#fff';
      if(dataRow['Building Extant']['value'] !== 'Extant') {
        color = '#000';
      }
      var marker = L.marker([dataRow.geodata[0].lat, dataRow.geodata[0].lon], {
        // https://fontawesome.com/v4.7.0/icons/
          icon: L.icon.glyph({ 
            prefix: 'fa', 
            glyph: 'circle',
            glyphColor: color
          })
        });
      const markup = `
        <h6>${dataRow['Site']['value']}</h6>
        <p>
          <strong>Landmark Status</strong><br/>
          ${dataRow['Landmark Status']['value'] ? dataRow['Landmark Status']['value'] : 'N/A'}<br/>
          <strong>Importance</strong><br/>
          ${dataRow['Importance']['value'] ? dataRow['Importance']['value'] : 'N/A'}<br/>
          <strong>Address</strong><br/>
          ${dataRow['geodata'][0]['address']['house_number'] ? dataRow['geodata'][0]['address']['house_number'] : ''} ${dataRow['geodata'][0]['address']['road'] ? dataRow['geodata'][0]['address']['road'] : ''}
        </p>
      `;
      marker.bindPopup(markup);
      marker.addTo(mymap);
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.setAttribute('href','#');
      // link.classList.add('list-group-link');
      link.innerHTML = `${dataRow['Site']['value']}`;
      link.addEventListener('click', event => {
        marker.togglePopup();
        event.preventDefault();
      });
      item.appendChild(link);
      document.querySelector('#properties').appendChild(item);

      // markers.addLayer(marker)
    } else {
      console.log('no geodata', dataRow);
    }
  });
  // mymap.addLayer(markers);
});
