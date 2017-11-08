'use strict';

const WebSocket = require('ws');
const msg = require('../shared/socket-messages');
const Room = require('./room');

const Server = {

  create(port = 8080 ) {
    this.currentClientId = 0;
    this.currentRoomId = 0;
    this.rooms = [];
    this.clients = {};
    this.wss = new WebSocket.Server({ port: port });
    Server.registerEvents();
    Server.tick();
    Server.init();
    return Server;
  },

  init() {
    for (let i = 0; i < 10; i++) {
      Server.createRoom();
    }
  },

  createRoom() {
    this.currentRoomId++;
    let room = new Room(this.currentRoomId);
    this.rooms.push(room);
    return room;
  },

  getRooms() {
    return this.rooms;
  },

  getRoomCount() {
    return this.rooms.length;
  },

  getRoom(index) {
    return this.rooms[index];
  },

  getAvailableRoom() {
    if (!this.rooms.length || this.rooms[this.rooms.length-1].isFull()) {
      return this.createRoom();
    }
    return this.rooms[this.rooms.length-1];
  },

  registerEvents() {

    this.wss.on('connection', (ws) => {

      this.currentClientId++;
      this.clients[this.currentClientId] = ws;

      this.send(this.currentClientId, {
        action: 'handshake',
        id: this.currentClientId
      });

      ws.on('message', (message) => {
        this.received(message);
      });
    });
  },

  send(clientId, data) {
    this.clients[clientId].send(JSON.stringify(data));
  },

  broadcast(data) {
    data = JSON.stringify(data);
    for (let id in this.clients) {
      this.clients[id].send(data);
    }
  },

  received(message) {

    let data = JSON.parse(message);

    if (data.action === msg.ROOM_REQUEST_JOIN) {

      let room = null;
      if ('roomIndex' in data) {
        room = Server.getRoom(data.roomIndex);
      } else {
        room = Server.getAvailableRoom()
      }

      room.createPlayer(data.playerName);

      Server.send(data.clientId, {
        action: msg.SERVER_MESSAGE,
        message: 'You have joined room ' + room.id
      });
    }
  },

  tick() {

    console.log('tick');

    if (this.rooms.length) {

      this.broadcast({
        action: 'roomIndex',
        count: this.getRoomCount(),
        rooms: this.rooms.map((r, i) => {
          let data = r.getPackageData();
          data.index = i;
          return data;
        })
      });
    }

    setTimeout(() => {
      this.tick();
    }, 1000);
  }
};

module.exports = Server;