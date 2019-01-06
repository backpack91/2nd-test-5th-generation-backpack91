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
      url: `https://api.meetup.com/find/upcoming_events?&sign=true&photo-host=public&lon=${lon}&page=20&lat=${lat}&fields=event_hosts&radius=5&key=7c75b126f72181153575d6f30631f68`,
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
  }).then((val) => {
    listUp(val);
  }).catch((err) => {
    console.log('Error: ', err);
  })
}


// $.ajax({
//   // url: `https://api.meetup.com/find/upcoming_events?&sign=true&photo-host=public&lon=126.985307&page=20&lat=37.561083&key=7c75b126f72181153575d6f30631f68`,
//   url: `https://api.meetup.com/find/upcoming_events?&sign=true&photo-host=public&lon=126.985307&page=20&lat=37.561083&fields=event_hosts&key=7c75b126f72181153575d6f30631f68`,
//   dataType: 'jsonp',
//   jsonpCallback: 'myCallback',
//   success: function(data) {
//     console.log('호스트사진 받아오기 성공 - ', data.data.events);
//     resolve(data.data.events);
//   },
//   error: function(err) {
//     console.log('호스트 사진 받아오기 실패 - ', err);
//     reject(err);
//   }
// });

function listUp (val) {
  let count = 0;
  let sameLocatedMeetUp = {};
  let thisMeetUp;

  if (val && val.length > 0) {
    for (let i = 0; i < val.length; i++) {
      makeList(val[i]);
      thisMeetUp = document.querySelector('.list').children[count];
      var data = val[i];

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
          sameLocatedMeetUp[(data.venue.lat) + '|' + (data.venue.lon)].forEach((item) => {
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
}

function makeList (eventObject) {
  var body = document.createElement('div');
  var header = document.createElement('div');
  var eventTitleWrapper = document.createElement('div');
  var eventTitle = document.createElement('div');
  var star = document.createElement('div');
  var groupTitle = document.createElement('div');
  var subHeader = document.createElement('div');
  var details = document.createElement('div');
  var date = document.createElement('div');
  var time = document.createElement('div');
  var rsvp = document.createElement('div');
  var member = document.createElement('div');

  eventTitle.innerText = eventObject.name;
  groupTitle.innerText = eventObject.group.name;
  date.innerText = '날짜: ' + eventObject.local_date;
  time.innerText = '시간: ' + eventObject.local_time;
  rsvp.innerText = '참여인원: ' + eventObject.yes_rsvp_count;
  star.innerHTML = '<i class="far fa-star"></i>';
  body.classList.add('eventBody');
  header.classList.add('eventHeader');
  eventTitle.classList.add('eventTitle');
  eventTitleWrapper.classList.add('eventTitleWrapper');
  star.classList.add('star');
  groupTitle.classList.add('groupTitle');
  subHeader.classList.add('subHeader');
  member.classList.add('eventMember');
  details.classList.add('eventDetailsWrapper');
  date.classList.add('eventDetails');
  time.classList.add('eventDetails');
  rsvp.classList.add('eventDetails');
  eventTitleWrapper.appendChild(eventTitle);
  eventTitleWrapper.appendChild(star);
  header.appendChild(eventTitleWrapper);
  subHeader.appendChild(groupTitle);
  details.appendChild(date);
  details.appendChild(time);
  details.appendChild(rsvp);
  body.appendChild(header);
  body.appendChild(subHeader);
  body.appendChild(member);
  body.appendChild(details);
  if (eventObject['event_hosts']) {
    console.log('photo: ', eventObject.event_hosts[0].photo.highres_link);
    for (let i = 0; i < eventObject.event_hosts.length; i++) {
      var imgBox = document.createElement('img');
      imgBox.src = eventObject.event_hosts[i].photo.highres_link;
      imgBox.classList.add('hostImg');
      member.appendChild(imgBox);
    }
  } else {
    console.log('don\'t have event_hosts');
  }
  star.addEventListener('click', (e) => {
    console.log('e.target: ', e.target);
    console.log('e.currentTarget: ', e.currentTarget);
  });
  document.querySelector('.list').appendChild(body);
}

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
