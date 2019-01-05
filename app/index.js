// Load application styles
import 'styles/index.less';

// ================================
// START YOUR APP HERE
// ================================

// You can use jquery for ajax request purpose only.
import $ from 'jquery';

let basicInfoStorage = [];
let hostsInfoStorage = [];
let markerToBeRemoved = [];

function getMeetUpList(lon, lat) {
  return new Promise ((resolve, reject) => {
    $.ajax({
      // url: `https://api.meetup.com/find/upcoming_events?&sign=true&photo-host=public&lon=126.985307&page=20&lat=37.561083&key=7c75b126f72181153575d6f30631f68`,
      url: `https://api.meetup.com/find/upcoming_events?&sign=true&photo-host=public&lon=${lon}&page=20&lat=${lat}&key=7c75b126f72181153575d6f30631f68`,
      dataType: 'jsonp',
      jsonpCallback: 'myCallback',
      success: function(data) {
        console.log('성공 - ', data.data.events);
        resolve(data.data.events);
      },
      error: function(err) {
        console.log('실패 - ', err);
        reject(err);
      }
    });
  })
  .then((val) => {
    if (val.length > 0) {
      let count = 0;
      let sameLocatedMeetUp = {};
      for (let i = 0; i < val.length; i++) {
        makeList(val[i]);
        var thisMeetUp = document.querySelector('.list').children[count];
        // thisMeetUp.setAttribute('id', `l${count}`);
        // console.log('thisMeetUp: ', thisMeetUp);
        // console.log(val[i].group.name);
        var data = val[i];
        new Promise ((resolve, reject) => {
        });
        if (data.venue) {
          if (sameLocatedMeetUp[data.venue.lat + '|' + data.venue.lon]) {
            sameLocatedMeetUp[data.venue.lat + '|' + data.venue.lon].push(thisMeetUp);
          } else {
            sameLocatedMeetUp[data.venue.lat + '|' + data.venue.lon] = [];
          }
          var marker = new google.maps.Marker({
            position: new google.maps.LatLng(data.venue.lat, data.venue.lon),
            map: map,
            animation: google.maps.Animation.DROP
          });
          marker.addListener('click', (e) => {
            sameLocatedMeetUp[data.venue.lat + '|' + data.venue.lon].forEach((item) => {
              item.classList.add('chosenMeetUp');
            });
          });
        } else {
          if (sameLocatedMeetUp[data.group.lat + '|' + data.group.lon]) {
            sameLocatedMeetUp[data.group.lat + '|' + data.group.lon].push(thisMeetUp);
          } else {
            sameLocatedMeetUp[data.group.lat + '|' + data.group.lon] = [];
          }
          var marker = new google.maps.Marker({
            position: new google.maps.LatLng(data.group.lat, data.group.lon),
            map: map,
            animation: google.maps.Animation.DROP
          });
          markerToBeRemoved.push(marker);
          marker.addListener('click', (e) => {
            sameLocatedMeetUp[data.group.lat + '|' + data.group.lon].forEach((item) => {
              item.classList.add('chosenMeetUp');
            });
          });
        }
        markerToBeRemoved.push(marker);
        count++;
      }
    } else {
      var emptyMessage = document.createElement('div');
      emptyMessage.classList.add('emptyMessage');
      emptyMessage.innerText = 'I can\'t find MEETUP ;(';
      document.querySelector('.list').appendChild(emptyMessage);
    }
  })
}

function makeList (eventObject) {
  var body = document.createElement('div');
  var header = document.createElement('div');
  var eventTitle = document.createElement('div');
  var groupTitle = document.createElement('div');
  var member = document.createElement('div');
  var details = document.createElement('div');
  var date = document.createElement('div');
  var time = document.createElement('div');
  eventTitle.innerText = eventObject.name;
  groupTitle.innerText = eventObject.group.name;
  date.innerText = '날짜: ' + eventObject.local_date;
  time.innerText = '시간: ' + eventObject.local_time;
  body.classList.add('eventBody');
  header.classList.add('eventHeader');
  eventTitle.classList.add('eventTitle');
  groupTitle.classList.add('groupTitle');
  member.classList.add('eventMember');
  details.classList.add('eventDetails');
  date.classList.add('eventDate');
  time.classList.add('eventTime');
  header.appendChild(eventTitle);
  member.appendChild(groupTitle);
  details.appendChild(date);
  details.appendChild(time);
  body.appendChild(header);
  body.appendChild(member);
  body.appendChild(details);
  document.querySelector('.list').appendChild(body);
}

//lon과 lat
//https://api.meetup.com/find/upcoming_events?&sign=true&photo-host=public&lon=126.985307&page=20&lat=37.561083
var map;
var seoul = {lat: 37.561083, lng: 126.985307}

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: seoul,
    zoom: 16
  });
  var geocoder = new google.maps.Geocoder;
  var infowindow = new google.maps.InfoWindow;
  var marker = new google.maps.Marker({position: seoul, map: map});

  map.addListener( "click", function (event) {
    markerToBeRemoved.forEach((item) => {
      item.setMap(null);
    });
    document.querySelector('.list').innerHTML = '';
    var latitude = event.latLng.lat();
    var longitude = event.latLng.lng();
    // geocodeLatLng(geocoder, map, infowindow, latitude, longitude);
    getMeetUpList(longitude, latitude);
    console.log( latitude + ', ' + longitude );
  });
}
initMap();

// function geocodeLatLng(geocoder, map, infowindow, latitude, longitude) {
//   var latlng = {lat: parseFloat(latitude), lng: parseFloat(longitude)};
//   geocoder.geocode({'location': latlng}, function(results, status) {
//     if (status === 'OK') {
//       if (latitude) {
//         map.setZoom(11);
//         var marker = new google.maps.Marker({
//           position: latlng,
//           map: map
//         });
//         infowindow.setContent(latitude.formatted_address);
//         infowindow.open(map, marker);
//       } else {
//         window.alert('No results found');
//       }
//     } else {
//       window.alert('Geocoder failed due to: ' + status);
//     }
//   });
// }
