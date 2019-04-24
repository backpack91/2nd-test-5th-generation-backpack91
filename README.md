## vanilla-meetup

Google Map API & [Meetup Upcoming Events API](https://www.meetup.com/meetup_api/docs/find/upcoming_events/)을 이용하여 사용자가 선택한 지역의 Meetup List를 보여주는 애플리케이션입니다.

## Setup

Install dependencies

```sh
$ yarn install (or npm install)
```

## Development

```sh
$ yarn dev (or npm run dev)
# visit http://localhost:8080
```

## Features

- [ ] 메인 화면에는 Google Map과 Meetup List을 보여줍니다.
- [ ] 사용자는 Google Map에서 원하는 지역을 클릭하여 선택할 수 있습니다.
- [ ] 사용자가 지역을 클릭하면 [Meetup Upcoming Events API](https://www.meetup.com/meetup_api/docs/find/upcoming_events/)를 이용하여 사용자가 선택한 지역의 Meetup List를 보여줍니다.
- [ ] Meetup List는 아래와 같은 기본적인 이벤트의 정보들을 포함하고 있습니다.
  - [ ] 이벤트 이름
  - [ ] Meetup Group 이름
  - [ ] 이벤트 날짜 및 시간
  - [ ] RSVP 인원
  - [ ] 이벤트 호스트의 이름과 사진
- [ ] Meetup List에는 즐겨찾기 기능이 있습니다.
  - [ ] 사용자는 원하는 Meetup을 즐겨찾기에 추가할 수 있습니다.
  - [ ] 하트아이콘을 클릭하여 원하는 Meetup을 즐겨찾기에 추가할 수 있습니다.
  - [ ] 사용자는 하트아이콘을 다시 클릭하여 즐겨찾기에 추가한 Meetup을 다시 즐겨찾기에서 삭제할 수 있습니다.
  - [ ] 즐겨찾기에 관련한 Meetup API는 없기 때문에, [Local Storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)를 이용하여 즐겨찾기 목록이 저장되도록 구현하였습니다.
