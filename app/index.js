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

function getGoogleMap() {
  return new Promise ((resolve, reject) => {
    $.ajax({
      url: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDC1nZk56ufK4AGgpSIr9Z3Bq0ksP3ls9U&libraries=places',
      dataType: 'jsonp',
      jsonpCallback: 'myCallback',
      success: function () {
        resolve();
        console.log('got googleMap: ');
      },
      error: function (err) {
        console.log('fail to get googleMap: ', err);
        reject(err);
      }
    });
  }).then(() => {
    // console.log('googleVal: ', google);
    // initMap();
    initAutocomplete();
  }).catch((err) => {
    console.log('getGoogleMap Error: ', err);
  });
}

function getMeetUpList(lon, lat) {
  return new Promise ((resolve, reject) => {
    $.ajax({
      url: `https://api.meetup.com/find/upcoming_events?&sign=true&photo-host=public&lon=${lon}&page=20&lat=${lat}&fields=event_hosts,description_images,featured_photo&radius=3&key=7c75b126f72181153575d6f30631f68`,
      dataType: 'jsonp',
      jsonpCallback: 'myCallback',
      success: function(data) {
        console.log('성공 - ', data.data.events);
        resolve(data.data.events);
        meetUpListStorage = data.data.events;
        console.log('meetUpListStorage: ', meetUpListStorage);
      },
      error: function(err) {
        console.log('실패 - ', err);
        reject(err);
      }
    });
  }).then((val) => {
    markUp(val);
  }).catch((err) => {
    console.log('Error: ', err);
  });
}

function markUp (val) {
  if (val && val.length > 0) {
    for (let i = 0; i < val.length; i++) {
      makeList(val[i]);
      var data = val[i];

      if (data.venue) {
        console.log('isworking?');
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(data.venue.lat, data.venue.lon),
          map: map,
          animation: google.maps.Animation.DROP
        });
        console.log('marker: ', marker);
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
    var emptyMessage = document.createElement('div');
    emptyMessage.classList.add('emptyMessage');
    emptyMessage.innerText = 'I can\'t find MEETUP ;(';
    document.querySelector('.list').appendChild(emptyMessage);
  }
}

function makeList (eventObject) {
  var body = document.createElement('div');
  var header = document.createElement('div');
  var eventTitleWrapper = document.createElement('div');
  var eventTitle = document.createElement('div');
  var heart = document.createElement('div');
  var groupTitle = document.createElement('div');
  var eventInfo = document.createElement('div');
  var details = document.createElement('div');
  var detail = document.createElement('div');
  var member = document.createElement('div');

  eventTitle.innerText = eventObject.name;
  groupTitle.innerText = eventObject.group.name;
  detail.innerText = `date: ${eventObject.local_date} | time: ${eventObject.local_time} | rsvg: ${eventObject.yes_rsvp_count}`;
  // console.log('eventObject.id: ', eventObject.id);
  if (localStorage.getItem(eventObject.id)) {
    heart.innerHTML = '<i class="fas fa-heart"></i>';
  } else {
    heart.innerHTML = '<i class="far fa-heart"></i>';
  }
  heart.setAttribute('id', eventObject.id);
  body.classList.add('eventBody');
  body.setAttribute('id', 'E' + eventObject.id);
  header.classList.add('eventHeader');
  eventTitle.classList.add('eventTitle');
  eventTitleWrapper.classList.add('eventTitleWrapper');
  if (eventObject.featured_photo && eventObject.featured_photo.photo_link) {
    eventTitleWrapper.setAttribute('style', `background-image: url(${eventObject.featured_photo.photo_link});`);
  } else {
    eventTitleWrapper.classList.remove('eventTitleWrapper');
    eventTitleWrapper.classList.add('eventTitleWrapperWithoutPic');
  }
  heart.classList.add('heart');
  groupTitle.classList.add('groupTitle');
  eventInfo.classList.add('eventInfo');
  member.classList.add('eventMember');
  details.classList.add('eventDetailsWrapper');
  detail.classList.add('eventDetails');
  eventTitleWrapper.appendChild(eventTitle);
  eventTitleWrapper.appendChild(heart);
  // header.appendChild(eventTitleWrapper);
  details.appendChild(groupTitle);
  details.appendChild(detail);
  eventInfo.appendChild(member);
  eventInfo.appendChild(details);
  body.appendChild(eventTitleWrapper);
  body.appendChild(eventInfo);
  // body.appendChild(details);
  // body.appendChild(member);
  if (eventObject['event_hosts']) {
    // console.log('photo: ', eventObject.event_hosts[0].photo.highres_link);
    // for (let i = 0; i < eventObject.event_hosts.length; i++) {
    //   if (eventObject.event_hosts[i].photo.highres_link) {
    //     var imgBox = document.createElement('img');
    //     imgBox.src = eventObject.event_hosts[i].photo.highres_link;
    //     imgBox.onerror = function () {
    //       this.setAttribute('src', '/assets/images/altIMG_wh1200.jpg');
    //     };
    //     imgBox.classList.add('hostImg');
    //     member.appendChild(imgBox);
    //   }
    // }
    if (eventObject.event_hosts[0].photo.photo_link) {
      var imgBox = document.createElement('img');
      imgBox.src = eventObject.event_hosts[0].photo.photo_link;
      imgBox.onerror = function () {
        this.setAttribute('src', '/assets/images/altIMG_wh1200.jpg');
      };
      imgBox.classList.add('hostImg');
      member.appendChild(imgBox);
    }
  } else {
    var imgBox = document.createElement('img');
    imgBox.src = '/assets/images/altIMG_wh1200.jpg';
    // imgBox.onerror = function () {
    //   this.setAttribute('src', '/assets/images/altIMG_wh1200.jpg');
    // };
    imgBox.classList.add('hostImg');
    member.appendChild(imgBox);
    console.log('don\'t have event_hosts');
  }

  heart.addEventListener('click', (e) => {
    var thisMeetUp = document.querySelector(`#E${e.currentTarget.id}`);
    var infoStorage = {};
    if (localStorage.getItem('loglevel:webpack-dev-server')) {
      localStorage.removeItem('loglevel:webpack-dev-server');
    }
    if (e.currentTarget.innerHTML === '<i class="far fa-heart"></i>') {
      e.currentTarget.innerHTML = '<i class="fas fa-heart"></i>';
      infoStorage.header = thisMeetUp.children[0].innerText;
      // infoStorage.subHeader = thisMeetUp.children[1].innerText;
      infoStorage.details = thisMeetUp.children[1].children[1].innerHTML;
      infoStorage.hosts = thisMeetUp.children[1].children[0].innerHTML;
      infoStorage.id = e.currentTarget.id;
      // console.log('idOfLocalStorage: ', e.currentTarget.id);
      localStorage.setItem(e.currentTarget.id, JSON.stringify(infoStorage));
      // console.log('getItem', JSON.parse(localStorage.getItem(e.currentTarget.id)).id);
      // console.log('infoStorage: ', infoStorage);
    } else {
      e.currentTarget.innerHTML = '<i class="far fa-heart"></i>';
      localStorage.removeItem(e.currentTarget.id);
    }
    // console.log('e.target: ', e.target);
    // console.log('e.currentTarget: ', e.currentTarget);
    // console.log('localStrorage: ', localStorage);
  });
  document.querySelector('.list').appendChild(body);
}

document.querySelector('.bookMark').addEventListener('click', () => {
  var chart = document.querySelector('#bookmarkedChart');

  if (localStorage.getItem('loglevel:webpack-dev-server')) {
    localStorage.removeItem('loglevel:webpack-dev-server');
  }
  // if (key === 'loglevel:webpack-dev-server') {
  //   localStorage.removeItem('loglevel:webpack-dev-server');
  //   break;
  // }
  if (chart.classList.contains('hide')) {
    chart.classList.remove('hide');
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        var parsedData = JSON.parse(localStorage.getItem(key));
        // console.log('key: ', key);
        var event = document.createElement('div');
        var header = document.createElement('div');
        var subHeader = document.createElement('div');
        var details = document.createElement('div');
        var hosts = document.createElement('div');
        var deleteBox = document.createElement('div');

        deleteBox.classList.add('deleteBookmark');
        event.classList.add('bookmarkedEventBody');
        event.setAttribute('id', parsedData.id);
        header.classList.add('bookmarkedEventHeader');
        // subHeader.classList.add('groupTitle');
        details.classList.add('eventDetails');
        deleteBox.innerHTML = '<i class="fas fa-times"></i>';
        header.innerText = parsedData.header;
        // subHeader.innerText = parsedData.subHeader;
        details.innerHTML = parsedData.details;
        hosts.innerHTML = parsedData.hosts;
        subHeader.appendChild(header);
        // event.appendChild(subHeader);
        subHeader.appendChild(details);
        event.appendChild(hosts);
        event.appendChild(subHeader);
        event.appendChild(deleteBox);
        // event.innerHTML = '<div class="deleteBookmark"><i class="fas fa-times"></i></div>';
        chart.appendChild(event);

        deleteBox.addEventListener('click', (e) => {
          console.log(e.currentTarget.parentNode);
          localStorage.removeItem(e.currentTarget.parentNode.id);
          e.currentTarget.parentNode.remove();
          document.querySelector('.list').innerHTML = '';
          for (let i = 0; i < meetUpListStorage.length; i++) {
            makeList(meetUpListStorage[i]);
          }
        });
      }
    }
    // console.log('chart: ', chart);
  } else {
    chart.classList.add('hide');
    chart.innerHTML = '';
  }
});
var map;
var seoul = {lat: 37.561083, lng: 126.985307};

// function initMap() {
//   map = new google.maps.Map(document.getElementById('map'), {
//     center: seoul,
//     zoom: 16
//   });
//   var geocoder = new google.maps.Geocoder;
//   var infowindow = new google.maps.InfoWindow;
//   var marker = new google.maps.Marker({position: seoul, map: map});
//
//   map.addListener( "click", function (event) {
//     markerToBeRemoved.forEach((item) => {
//       item.setMap(null);
//     });
//     document.querySelector('.list').innerHTML = '';
//     var latitude = event.latLng.lat();
//     var longitude = event.latLng.lng();
//     getMeetUpList(longitude, latitude);
//     console.log( latitude + ', ' + longitude );
//   });
// }

// function initMap() {
//   map = new google.maps.Map(document.getElementById('map'), {
//     center: seoul,
//     zoom: 16
//   });
//   var geocoder = new google.maps.Geocoder;
//   var infowindow = new google.maps.InfoWindow;
//   var marker = new google.maps.Marker({position: seoul, map: map});
//
//   map.addListener( "click", function (event) {
//     markerToBeRemoved.forEach((item) => {
//       item.setMap(null);
//     });
//     document.querySelector('.list').innerHTML = '';
//     var latitude = event.latLng.lat();
//     var longitude = event.latLng.lng();
//     getMeetUpList(longitude, latitude);
//     console.log( latitude + ', ' + longitude );
//   });
// }
//
function initAutocomplete() {
  var bounds_changedByEnter = false;
  map = new google.maps.Map(document.getElementById('map'), {
    center: seoul,
    zoom: 12,
    mapTypeId: 'roadmap'
  });

  // var geocoder = new google.maps.Geocoder;
  // var infowindow = new google.maps.InfoWindow;
  var marker = new google.maps.Marker({position: seoul, map: map});
  // Create the search box and link it to the UI element.
  var input = document.getElementById('input');
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    if (bounds_changedByEnter) {
      var searchedLocation = map.getCenter();
      console.log('searchedLocation: ', searchedLocation.lng());
      console.log('searchedLocation: ', searchedLocation.lat());
      markerToBeRemoved.forEach((item) => {
        item.setMap(null);
      });
      document.querySelector('.list').innerHTML = '';
      searchBox.setBounds(map.getBounds());
      getMeetUpList(searchedLocation.lng(), searchedLocation.lat());
      map.setZoom(12);
      map.setCenter(searchBox.getPlaces()[0].geometry.location);
      bounds_changedByEnter = false;
    }
  });

  input.addEventListener('keypress', function(event) {
    if (event.keyCode === 13) {
      bounds_changedByEnter = true;
    }
  });



  // input.addListener('keypress', function(event) {
  //   // var searchedLocation = map.getCenter();
  //   // console.log('searchedLocation: ', searchedLocation.lng());
  //   // console.log('searchedLocation: ', searchedLocation.lat());
  //   if (event.keyCode === 13) {
  //     markerToBeRemoved.forEach((item) => {
  //       item.setMap(null);
  //     });
  //     // document.querySelector('.list').innerHTML = '';
  //     searchBox.setBounds(map.getBounds());
  //     getMeetUpList(searchedLocation.lng(), searchedLocation.lat());
  //   }
  // });

  var markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }
      var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.
      markers.push(new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
      }));

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
    // map.setZoom(13);
    // map.setCenter(searchedLocation);
  });

  map.addListener( "click", function (event) {
    markerToBeRemoved.forEach((item) => {
      item.setMap(null);
    });
    document.querySelector('.list').innerHTML = '';
    var latitude = event.latLng.lat();
    var longitude = event.latLng.lng();
    getMeetUpList(longitude, latitude);
    console.log( latitude + ', ' + longitude );
  });
  getMeetUpList(seoul.lng, seoul.lat);
}

getGoogleMap();
