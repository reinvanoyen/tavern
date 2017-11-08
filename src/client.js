const EventManager = require('./shared/event-manager');
const msg = require('./shared/socket-messages');

const Client = require('./client/client');
const RoomIndex = require('./client/ui/room-index');

let client = new Client();
client.connect();

let roomIndex = new RoomIndex();
document.body.appendChild(roomIndex.build());

EventManager.on('requestJoinRoom', e => {

  client.send({
    action: msg.ROOM_REQUEST_JOIN,
    roomIndex: e.roomIndex,
    playerName: e.playerName
  });
});

EventManager.on('receivedServerMessage', e => {
  alert(e.message);
});