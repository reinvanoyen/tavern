const EventManager = require('./shared/event-manager');
const msg = require('./shared/socket-messages');

const Client = require('./shared/client');
const RoomIndex = require('./client/ui/room-index');
const GlobalSay = require('./client/ui/global-say');

// ui
let clientStatus = document.createElement('span');
document.body.appendChild(clientStatus);

// Websocket
let ws = new WebSocket('ws://localhost:8080');
clientStatus.textContent = 'Joining...';

ws.onopen = () => {
  clientStatus.textContent = 'Connected';
  connected(ws);
};

ws.onerror = (error) => {
  clientStatus.textContent = 'Connection failed';
};

function connected() {

  let client = new Client(ws);

  ws.onmessage = (message) => {
    client.received(message);
  };

  let roomIndex = new RoomIndex();
  let global = new GlobalSay();
  document.body.appendChild(roomIndex.build());

  EventManager.on('requestJoinRoom', e => {

    client.send({
      action: msg.CL_JOIN_ROOM,
      roomIndex: e.roomIndex,
      playerName: e.playerName
    });
  });

  EventManager.on('sendMessage', e => {
    client.send({
      action: msg.CL_SAY,
      message: e.message
    });
  });

  document.body.appendChild(global.build());
}