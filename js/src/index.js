import * as L from 'leaflet';
// import 'leaflet.markercluster';
import 'leaflet.icon.glyph';

function createFunctionWithTimeout(callback, opt_timeout) {
  var called = false;
  function fn() {
    if (!called) {
      called = true;
      callback();
    }
  }
  setTimeout(fn, opt_timeout || 1000);
  return fn;
}

function triggerGAEvent(eventCategory, eventAction, eventLabel, callback) {
  if ( 'ga' in window && window.ga !== undefined && typeof window.ga === 'function' ) {
    var gaEvent = {
      hitType: 'event',
      eventCategory: eventCategory,
      eventAction: eventAction,
      eventLabel: eventLabel,
      hitCallback: createFunctionWithTimeout(callback)
    };
    if(typeof navigator !== 'undefined') {
      if(typeof navigator.sendBeacon !== 'undefined') {
        ga('set', 'transport', 'beacon');
      }
    }
    ga('send', gaEvent);
    return true;
  }
  return false;
}

// https://wiki.openstreetmap.org/wiki/Tile_servers
var tiles = L.tileLayer('https://api.maptiler.com/maps/streets/256/{z}/{x}/{y}@2x.png?key=2YXRM0uTljQEY5Z3BxD8', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }),
  latlng = L.latLng(37.75877280300828, -122.41928100585939);

var mymap = L.map('map', {center: latlng, zoom: 13, layers: [tiles]});
// mymap.on('popupopen', function(e) {
//   var px = mymap.project(e.target._popup._latlng); // find the pixel location on the map where the popup anchor is
//   px.y -= e.target._popup._container.clientHeight/2; // find the height of the popup container, divide by 2, subtract from the Y axis of marker location
//   mymap.panTo(mymap.unproject(px),{animate: true}); // pan to new center
// });
// var markers = L.markerClusterGroup({
//   maxClusterRadius: 1
// });

function inHazeValley(name = '') {
  const inHazeValley = [
    "Women's Skill Center",
    "San Francisco Women's Centers"
  ];
  return inHazeValley.includes(name);
}

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
    let neighborhood = dataRow['geodata'][0]['address']['neighbourhood'] ? dataRow['geodata'][0]['address']['neighbourhood'] : 'San Francisco';
    neighborhood = dataRow['geodata'][0]['address']['residential'] && !dataRow['geodata'][0]['address']['neighbourhood'] ? dataRow['geodata'][0]['address']['residential'] : neighborhood;
    neighborhood = neighborhood == 'Potrero Terrace' ? 'Potrero Hill' : neighborhood;

    if(inHazeValley(dataRow['Site']['value'])) {
      neighborhood = 'Hayes Valley';
    }

    const neighborhood_machine = neighborhood.replace(/\s+/g, '-').toLowerCase(); 
    if(!document.querySelector(`#${neighborhood_machine}`)) {

      // const cardHeader = document.createElement('div');
      // cardHeader.innerHTML = neighborhood;
      // cardHeader.classList.add('card-header');
      // cardHeader.setAttribute('id', `${neighborhood_machine}__card_header`);
      // cardHeader.setAttribute('data-toggle', 'collapse');
      // cardHeader.setAttribute('data-target', `#${neighborhood_machine}__group`);
      // cardHeader.setAttribute('aria-controls', `${neighborhood_machine}__group`);
      // const card = document.createElement('div');
      // card.classList.add('card');

      // const cardBody = document.createElement('div');
      // cardBody.classList.add('card-body');
      // cardBody.setAttribute('id',neighborhood_machine);
      // const collapse = document.createElement('div');
      // collapse.classList.add('collapse');
      // collapse.setAttribute('aria-labelledby', `${neighborhood_machine}__card_header`);
      // collapse.setAttribute('data-parent', '#accordionExample');
      // collapse.setAttribute('id', `${neighborhood_machine}__group`);
      // collapse.appendChild(cardBody);
      
      // card.appendChild(cardHeader);
      // card.appendChild(collapse);

      // document.querySelector('#accordionExample').appendChild(card);

      const item = document.createElement("li");
      item.setAttribute('id',neighborhood_machine);
      const title = document.createElement('strong');
      title.innerHTML = neighborhood;
      title.classList.add('neighborhood-title');
      item.appendChild(title);
      const ul = document.createElement('ul');
      ul.setAttribute('id',`${neighborhood_machine}__list`);
      item.appendChild(ul);
      document.querySelector('#properties').appendChild(item);
    }
  });
  json.forEach(dataRow => {
    if(dataRow.geodata && dataRow.geodata[0]) {
      let neighborhood = dataRow['geodata'][0]['address']['neighbourhood'] ? dataRow['geodata'][0]['address']['neighbourhood'] : 'San Francisco';
      neighborhood = dataRow['geodata'][0]['address']['residential'] && !dataRow['geodata'][0]['address']['neighbourhood'] ? dataRow['geodata'][0]['address']['residential'] : neighborhood;
      neighborhood = neighborhood == 'Potrero Terrace' ? 'Potrero Hill' : neighborhood;

      if(inHazeValley(dataRow['Site']['value'])) {
        neighborhood = 'Hayes Valley';
      }

      const neighborhood_machine = neighborhood.replace(/\s+/g, '-').toLowerCase(); 
      let color = '#000';
      if(dataRow['Building Extant']['value'] !== 'Extant') {
        color = '#fff';
      }
      var marker = L.marker([dataRow.geodata[0].lat, dataRow.geodata[0].lon], {
        // https://fontawesome.com/v4.7.0/icons/
          icon: L.icon.glyph({ 
            prefix: 'fa', 
            glyph: 'circle',
            glyphColor: color
          })
        });

      const overlayId = `image-overlay--${dataRow['Site']['value'].replace(/\s+/g, '-').replace(/[^\w\s]/gi, '').toLowerCase()}`;
      const markup = `
        <h6>${dataRow['Site']['value']}</h6>
        <div>
          ${dataRow['Description']['value'] ? `${dataRow['Description']['value']}<br/>` : ''}
          ${dataRow['Address']['value'] ? `<strong>Address</strong><br/>${dataRow['Address']['value']}<br/>` : '' }
          ${dataRow['Landmark Status']['value'] && dataRow['Landmark Status']['value'] !== 'none' ? `<strong>Landmark Status</strong><br/>${dataRow['Landmark Status']['value']}` : ''}<br/>
          <div>${dataRow['Image']['value']? `<img data-overlay="#${overlayId}" src="/assets/img/${dataRow['Image']['value']}" /> ${dataRow['Image Source']['value']? `<div class="img-src">Image Source: ${dataRow['Image Source']['value']}</div>`: ''}`:''}</div>
        </div>
      `;
      const popup = marker.bindPopup(markup);
      marker.addTo(mymap);
      const item = document.createElement("li");
      // const item = document.createElement("div");
      const link = document.createElement("a");
      link.setAttribute('href','#');
      // link.classList.add('list-group-link');
      link.innerHTML = `${dataRow['Site']['value']}`;
      link.womensRightsProperties = {
        site: dataRow['Site']['value'] ? dataRow['Site']['value'] : null
      };
      link.addEventListener('click', event => {
        const siteName =  event.target.womensRightsProperties.site ? event.target.womensRightsProperties.site : 'no-site-name';
        if(!triggerGAEvent('open-popup--link', 'popupopen', siteName , function() {
          console.log(siteName,'open-popup--link hitCallback completed');
        }));
        if(!popup.isPopupOpen()) {
          marker.openPopup();
        }
        document.querySelector('#map').scrollIntoView();
        event.preventDefault();
      });
      popup.womensRightsProperties = {
        site: dataRow['Site']['value'] ? dataRow['Site']['value'] : null
      };
      popup.addEventListener('popupopen', event => {
        const siteName =  event.target.womensRightsProperties.site ? event.target.womensRightsProperties.site : 'no-site-name';
        const imageInPopup = document.querySelectorAll(`[data-overlay="#${overlayId}"]`)[0];
        if(!triggerGAEvent('open-popup', 'popupopen', siteName , function() {
          console.log(siteName,'open-popup hitCallback completed');
        }));
        const opentOverlayEvent = (event) => {
          console.log('opentOverlayEvent', event);
          console.log('opentOverlayEvent', this);
          event.preventDefault();
          document.querySelectorAll('body')[0].classList.add('overlay-open');
          const overlay = document.querySelector(`#${overlayId}`);
          overlay.classList.add('overlay-open');
          if(!triggerGAEvent('overlay-opened', 'popupopen', siteName , function() {
            console.log(siteName,'overlay-opened hitCallback completed');
          }));
          overlay.addEventListener('click', event => {
            document.querySelectorAll('body')[0].classList.remove('overlay-open');
            overlay.classList.remove('overlay-open');
            if(!triggerGAEvent('overlay-closed', 'popupopen', siteName , function() {
              console.log(siteName,'overlay-closed hitCallback completed');
            }));
          });
        }
        if(imageInPopup) {
          imageInPopup.removeEventListener('click', opentOverlayEvent, false);
          imageInPopup.addEventListener('click', opentOverlayEvent);
        }
      }, false)
      item.appendChild(link);

      if(dataRow['Image']['value']) {
        (function() {
          const imageOverlay = document.createElement('div');
          imageOverlay.setAttribute('id', `${overlayId}`);
          imageOverlay.classList.add('image-overlay');
          const imageOverlayInner = document.createElement('div');
          imageOverlayInner.classList.add('image-overlay__inner');
          const image = document.createElement('img');
          image.setAttribute('src',`/assets/img/${dataRow['Image']['value']}`);

          const closeButton = document.createElement('span');
          closeButton.classList.add('close');
          closeButton.classList.add('cursor');
          closeButton.innerHTML = '&times;';

          imageOverlayInner.appendChild(image);
          imageOverlay.appendChild(closeButton);
          imageOverlay.appendChild(imageOverlayInner);
          // console.log(document.querySelector('#map'));
          document.querySelectorAll('body')[0].appendChild(imageOverlay);
        })();
      }
      const exantText = document.createElement('span');
      exantText.innerHTML = `${dataRow['Building Extant']['value']? ` (${dataRow['Building Extant']['value']})` : ''}`;
      item.appendChild(exantText);
      document.querySelector(`#${neighborhood_machine}__list`).appendChild(item);
      // document.querySelector(`#${neighborhood_machine}`).appendChild(item);

      // markers.addLayer(marker)
    } else {
      console.log('no geodata', dataRow);
    }
  });
  // mymap.addLayer(markers);
});
