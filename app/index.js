// Load application styles
import 'styles/index.less';

// ================================
// START YOUR APP HERE
// ================================

// You can use jquery for ajax request purpose only.
import $ from 'jquery';

let markerToBeRemoved = [];

function getMeetUpList(lon, lat) {
  return new Promise ((resolve, reject) => {
    $.ajax({
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
  });
}

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
  var member = document.createElement('div');

  eventTitle.innerText = eventObject.name;
  groupTitle.innerText = eventObject.group.name;
  date.innerText = `date: ${eventObject.local_date} | time: ${eventObject.local_time} | rsvg: ${eventObject.yes_rsvp_count}`;
  console.log('eventObject.id: ', eventObject.id);
  if (localStorage.getItem(eventObject.id)) {
    star.innerHTML = '<i class="fas fa-star"></i>';
  } else {
    star.innerHTML = '<i class="far fa-star"></i>';
  }
  star.setAttribute('id', eventObject.id);
  body.classList.add('eventBody');
  body.setAttribute('id', 'E' + eventObject.id);
  header.classList.add('eventHeader');
  eventTitle.classList.add('eventTitle');
  eventTitleWrapper.classList.add('eventTitleWrapper');
  star.classList.add('star');
  groupTitle.classList.add('groupTitle');
  subHeader.classList.add('subHeader');
  member.classList.add('eventMember');
  details.classList.add('eventDetailsWrapper');
  date.classList.add('eventDetails');
  eventTitleWrapper.appendChild(eventTitle);
  eventTitleWrapper.appendChild(star);
  header.appendChild(eventTitleWrapper);
  subHeader.appendChild(groupTitle);
  details.appendChild(date);
  body.appendChild(header);
  body.appendChild(subHeader);
  body.appendChild(details);
  body.appendChild(member);
  if (eventObject['event_hosts']) {
    console.log('photo: ', eventObject.event_hosts[0].photo.highres_link);
    for (let i = 0; i < eventObject.event_hosts.length; i++) {
      var imgBox = document.createElement('img');
      imgBox.src = eventObject.event_hosts[i].photo.highres_link;
      imgBox.onerror = function () {
        this.setAttribute('src', '/assets/images/altIMG_wh1200.jpg');
      };
      imgBox.classList.add('hostImg');
      member.appendChild(imgBox);
    }
  } else {
    console.log('don\'t have event_hosts');
  }

  star.addEventListener('click', (e) => {
    var thisMeetUp = document.querySelector(`#E${e.currentTarget.id}`);
    var infoStorage = {};
    if (localStorage.getItem('loglevel:webpack-dev-server')) {
      localStorage.removeItem('loglevel:webpack-dev-server');
    }
    if (e.currentTarget.innerHTML === '<i class="far fa-star"></i>') {
      e.currentTarget.innerHTML = '<i class="fas fa-star"></i>';
      infoStorage.header = thisMeetUp.children[0].innerText;
      infoStorage.subHeader = thisMeetUp.children[1].innerText;
      infoStorage.details = thisMeetUp.children[2].innerText;
      infoStorage.hosts = thisMeetUp.children[3].innerHTML;
      infoStorage.id = e.currentTarget.id;
      console.log('idOfLocalStorage: ', e.currentTarget.id);
      localStorage.setItem(e.currentTarget.id, JSON.stringify(infoStorage));
      console.log('getItem', JSON.parse(localStorage.getItem(e.currentTarget.id)).id);
      console.log('infoStorage: ', infoStorage);
    } else {
      e.currentTarget.innerHTML = '<i class="far fa-star"></i>';
      localStorage.removeItem(e.currentTarget.id);
    }
    console.log('e.target: ', e.target);
    console.log('e.currentTarget: ', e.currentTarget);
    console.log('localStrorage: ', localStorage);
  });
  document.querySelector('.list').appendChild(body);
}

document.querySelector('.bookMark').addEventListener('click', (e) => {
  var chart = document.querySelector('#bookmarkedChart');

  if (chart.classList.contains('hide')) {
    chart.classList.remove('hide');
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        var parsedData = JSON.parse(localStorage.getItem(key));
        console.log('key: ', key);
        var event = document.createElement('div');
        var header = document.createElement('div');
        var subHeader = document.createElement('div');
        var details = document.createElement('div');
        var hosts = document.createElement('div');
        event.classList.add('bookmarkedEventBody');
        header.classList.add('eventHeader');
        subHeader.classList.add('groupTitle');
        details.classList.add('eventDetails');
        header.innerText = parsedData.header;
        subHeader.innerText = parsedData.subHeader;
        details.innerText = parsedData.details;
        hosts.innerHTML = parsedData.hosts;
        event.appendChild(header);
        event.appendChild(subHeader);
        event.appendChild(details);
        event.appendChild(hosts);
        chart.appendChild(event);
      }
    }
    console.log('chart: ', chart);
  } else {
    chart.classList.add('hide');
    chart.innerHTML = '';
  }
});

var map;
var seoul = {lat: 37.561083, lng: 126.985307};

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
    getMeetUpList(longitude, latitude);
    console.log( latitude + ', ' + longitude );
  });
}
initMap();
