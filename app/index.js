// Load application styles
import 'styles/index.less';

// ================================
// START YOUR APP HERE
// ================================

// You can use jquery for ajax request purpose only.
import $ from 'jquery';

let meetUpListStorage;
let markerToBeRemoved = [];
var map;
var city;
var numberOfEvents;

function getGoogleMap() {
  // loading();
  return new Promise ((resolve, reject) => {
    $.ajax({
      url: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDC1nZk56ufK4AGgpSIr9Z3Bq0ksP3ls9U&libraries=places',
      dataType: 'jsonp',
      jsonpCallback: 'myCallback',
      success: function () {
        resolve();
      },
      error: function (err) {
        reject(err);
      }
    });
  }).then(() => {
    initAutocomplete();
  }).catch((err) => {
    console.log('getGoogleMap Error: ', err);
  });
}

function getMeetUpList(lon, lat) {
  // loading();
  return new Promise ((resolve, reject) => {
    $.ajax({
      url: `https://api.meetup.com/find/upcoming_events?&sign=true&photo-host=public&lon=${lon}&page=10&lat=${lat}&fields=event_hosts,description_images,featured_photo&radius=3&key=7c75b126f72181153575d6f30631f68`,
      dataType: 'jsonp',
      jsonpCallback: 'myCallback',
      success: function(data) {
        resolve(data.data);
        meetUpListStorage = data.data.events;
      },
      error: function(err) {
        reject(err);
      }
    });
  }).then((val) => {
    city = val.city.city;
    numberOfEvents = val.events.length;
    markUp(val.events);
  }).catch((err) => {
    console.log('Error: ', err);
  });
}

function markUp (val) {
  let data;
  const listHeader = document.querySelector('.listHeader');
  const bookmarkCounter = document.querySelector('.bookmarkCounter');

  if (localStorage.getItem('loglevel:webpack-dev-server')) {
    localStorage.removeItem('loglevel:webpack-dev-server');
  }
  bookmarkCounter.innerText = `${localStorage.length}`;
  listHeader.innerText = `${city}에서 ${numberOfEvents}개의 MeetUp`;
  document.querySelector('.list').innerHTML = '';
  if (val && val.length > 0) {
    for (let i = 0; i < val.length; i++) {
      makeList(val[i]);
      data = val[i];
      if (data.venue) {
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(data.venue.lat, data.venue.lon),
          map: map,
          animation: google.maps.Animation.DROP
        });
      } else {
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(data.group.lat, data.group.lon),
          map: map,
          animation: google.maps.Animation.DROP
        });
      }
      markerToBeRemoved.push(marker);
    }
  } else {
    const emptyMessage = document.createElement('div');

    emptyMessage.classList.add('emptyMessage');
    emptyMessage.innerText = 'I can\'t find MEETUP ;(';
    document.querySelector('.list').appendChild(emptyMessage);
  }
}

function makeList (eventData) {
  const body = document.createElement('div');
  const eventTitleWrapper = document.createElement('div');
  const eventTitle = document.createElement('div');
  const bookmarkAdder = document.createElement('div');
  const groupTitle = document.createElement('div');
  const eventInfos = document.createElement('div');
  const details = document.createElement('div');
  const detail = document.createElement('div');
  const member = document.createElement('div');
  const host = document.createElement('div');
  let imgBox;

  eventTitle.innerText = eventData.name;
  eventData.event_hosts ? host.innerText = `host: ${eventData.event_hosts[0].name}` : host.innerText;
  groupTitle.innerText = `group: ${eventData.group.name}`;
  detail.innerText = `date: ${eventData.local_date} | time: ${eventData.local_time} | rsvg: ${eventData.yes_rsvp_count}`;
  if (localStorage.getItem(eventData.id)) {
    bookmarkAdder.innerHTML = '<i class="fas fa-heart"></i>';
  } else {
    bookmarkAdder.innerHTML = '<i class="far fa-heart"></i>';
  }
  bookmarkAdder.setAttribute('id', eventData.id);
  body.classList.add('eventBody');
  body.setAttribute('id', 'E' + eventData.id);
  eventTitle.classList.add('eventTitle');
  eventTitleWrapper.classList.add('eventTitleWrapper');
  if (eventData.featured_photo && eventData.featured_photo.photo_link) {
    eventTitleWrapper.setAttribute('style', `background-image: url(${eventData.featured_photo.photo_link});`);
  } else {
    eventTitleWrapper.classList.remove('eventTitleWrapper');
    eventTitleWrapper.classList.add('eventTitleWrapperWithoutPic');
  }
  eventData.event_hosts ? host.classList.add('host') : eventData.event_hosts;
  bookmarkAdder.classList.add('bookmarkAdder');
  groupTitle.classList.add('groupTitle');
  eventInfos.classList.add('eventInfos');
  member.classList.add('eventMember');
  details.classList.add('eventDetailsWrapper');
  detail.classList.add('eventDetails');
  eventTitleWrapper.appendChild(eventTitle);
  eventTitleWrapper.appendChild(bookmarkAdder);
  eventData.event_hosts ? details.appendChild(host) : eventData.event_hosts;
  details.appendChild(groupTitle);
  details.appendChild(detail);
  eventInfos.appendChild(member);
  eventInfos.appendChild(details);
  body.appendChild(eventTitleWrapper);
  body.appendChild(eventInfos);
  if (eventData['event_hosts']) {
    if (eventData.event_hosts[0].photo.photo_link) {
      imgBox = document.createElement('img');
      imgBox.src = eventData.event_hosts[0].photo.photo_link;
      imgBox.onerror = function () {
        this.setAttribute('src', '/assets/images/altIMG_wh1200.jpg');
      };
      imgBox.classList.add('hostImg');
      member.appendChild(imgBox);
    }
  } else {
    imgBox = document.createElement('img');
    imgBox.src = '/assets/images/altIMG_wh1200.jpg';
    imgBox.classList.add('hostImg');
    member.appendChild(imgBox);
  }

  bookmarkAdder.addEventListener('click', (e) => {
    let thisMeetUp = document.querySelector(`#E${e.currentTarget.id}`);
    let infoStorage = {};
    const bookmarkCounter = document.querySelector('.bookmarkCounter');

    if (e.currentTarget.innerHTML === '<i class="far fa-heart"></i>') {
      e.currentTarget.innerHTML = '<i class="fas fa-heart"></i>';
      infoStorage.header = thisMeetUp.children[0].innerText;
      infoStorage.details = thisMeetUp.children[1].children[1].innerHTML;
      infoStorage.hosts = thisMeetUp.children[1].children[0].innerHTML;
      infoStorage.id = e.currentTarget.id;
      localStorage.setItem(e.currentTarget.id, JSON.stringify(infoStorage));
    } else {
      e.currentTarget.innerHTML = '<i class="far fa-heart"></i>';
      localStorage.removeItem(e.currentTarget.id);
    }
    bookmarkCounter.innerText = `${localStorage.length}`;
  });
  document.querySelector('.list').appendChild(body);
}

document.querySelector('.bookmark').addEventListener('click', () => {
  const chart = document.querySelector('#bookmarkedChart');

  if (localStorage.getItem('loglevel:webpack-dev-server')) {
    localStorage.removeItem('loglevel:webpack-dev-server');
  }
  if (chart.classList.contains('hide')) {
    chart.classList.remove('hide');
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const parsedData = JSON.parse(localStorage.getItem(key));
        const event = document.createElement('div');
        const header = document.createElement('div');
        const subHeader = document.createElement('div');
        const details = document.createElement('div');
        const hosts = document.createElement('div');
        const deleteBox = document.createElement('div');

        deleteBox.classList.add('deleteBookmark');
        event.classList.add('bookmarkedEventBody');
        event.setAttribute('id', parsedData.id);
        header.classList.add('bookmarkedEventHeader');
        details.classList.add('eventDetails');
        deleteBox.innerHTML = '<i class="fas fa-times"></i>';
        header.innerText = parsedData.header;
        details.innerHTML = parsedData.details;
        hosts.innerHTML = parsedData.hosts;
        subHeader.appendChild(header);
        subHeader.appendChild(details);
        event.appendChild(hosts);
        event.appendChild(subHeader);
        event.appendChild(deleteBox);
        chart.appendChild(event);

        deleteBox.addEventListener('click', (e) => {
          const bookmarkCounter = document.querySelector('.bookmarkCounter');

          localStorage.removeItem(e.currentTarget.parentNode.id);
          bookmarkCounter.innerText = `${localStorage.length}`;
          e.currentTarget.parentNode.remove();
          document.querySelector('.list').innerHTML = '';
          for (let i = 0; i < meetUpListStorage.length; i++) {
            makeList(meetUpListStorage[i]);
          }
          if (document.querySelector('#bookmarkedChart').children.length === 0) {
            document.querySelector('#bookmarkedChart').classList.add('hide');
          }
        });
      }
    }
  } else {
    chart.classList.add('hide');
    chart.innerHTML = '';
  }
});

function initAutocomplete() {
  const seoul = {lat: 37.561083, lng: 126.985307};
  let boundsChangedByEnter = false;
  const marker = new google.maps.Marker({position: seoul, map: map});
  const input = document.getElementById('input');
  const searchBox = new google.maps.places.SearchBox(input);
  let markers = [];

  map = new google.maps.Map(document.getElementById('map'), {
    center: seoul,
    zoom: 12,
    mapTypeId: 'roadmap'
  });
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  map.addListener('bounds_changed', function() {
    if (boundsChangedByEnter) {
      var searchedLocation = map.getCenter();

      markerToBeRemoved.forEach((item) => {
        item.setMap(null);
      });
      document.querySelector('.list').innerHTML = '';
      searchBox.setBounds(map.getBounds());
      getMeetUpList(searchedLocation.lng(), searchedLocation.lat());
      map.setZoom(12);
      map.setCenter(searchBox.getPlaces()[0].geometry.location);
      boundsChangedByEnter = false;
    }
  });
  input.addEventListener('keypress', function(event) {
    if (event.keyCode === 13) {
      boundsChangedByEnter = true;
    }
  });

  searchBox.addListener('places_changed', function() {
    const places = searchBox.getPlaces();
    const bounds = new google.maps.LatLngBounds();

    if (places.length == 0) {
      return;
    }
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers.length = 0;
    places.forEach(function(place) {
      const icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };
      if (!place.geometry) {
        return;
      }
      markers.push(new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
      }));
      if (place.geometry.viewport) {
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });

  map.addListener( "click", function (event) {
    const latitude = event.latLng.lat();
    const longitude = event.latLng.lng();

    markerToBeRemoved.forEach((item) => {
      item.setMap(null);
    });
    document.querySelector('.list').innerHTML = '';
    getMeetUpList(longitude, latitude);
  });
  getMeetUpList(seoul.lng, seoul.lat);
}

// function loading () {
//   var list = document.querySelector('.list');
//   list.innerHTML = '<div class="loading"><div class="spinner-wrapper"><span class="spinner-text">LOADING</span><span class="spinner"></span></div></div>';
// }

getGoogleMap();
