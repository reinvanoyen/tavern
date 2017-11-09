'use strict';

const WebSocket = require('ws');
const msg = require('../shared/socket-messages');
const Room = require('./room');
const Client = require('./../shared/client');

module.exports = class Server {

  static create(port = 8080 ) {
    this.currentClientId = 0;
    this.currentRoomId = 0;
    this.rooms = [];
    this.clients = {};
    this.clientCount = 0;
    this.wss = new WebSocket.Server({ port: port });
    Server.registerEvents();
    Server.tick();
    Server.init();
    return Server;
  }

  static init() {
    for (let i = 0; i < 10; i++) {
      Server.createRoom();
    }
  }

  static createRoom() {
    this.currentRoomId++;
    let room = new Room(this.currentRoomId);
    this.rooms.push(room);
    return room;
  }

  static getRooms() {
    return this.rooms;
  }

  static getRoomCount() {
    return this.rooms.length;
  }

  static getRoom(index) {
    return this.rooms[index];
  }

  static getAvailableRoom() {
    if (!this.rooms.length || this.rooms[this.rooms.length-1].isFull()) {
      return this.createRoom();
    }
    return this.rooms[this.rooms.length-1];
  }

  static registerEvents() {

    this.wss.on('connection', (ws) => {

      this.currentClientId++;
      let client = new Client(ws);
      client.setId(this.currentClientId);
      this.connectClient(client);

      ws.on('close', (message) => {
        this.disconnectClient(client);
      });

      ws.on('message', (message) => {
        this.received(message);
      });
    });
  }

  static send(clientId, data) {
    this.clients[clientId].send(data);
  }

  static broadcast(data) {
    for (let id in this.clients) {
      this.clients[id].send(data);
    }
  }

  static disconnectClient(client) {
    if (this.clients[client.getId()]) {
      this.clients[client.getId()].disconnect();
      delete this.clients[client.getId()];
      this.clientCount--;
      this.broadcast({
        action: msg.SV_SAY,
        message: 'Client (' + client.getId() + ') has disconnected'
      });
    }
  }

  static connectClient(client) {
    this.clients[client.getId()] = client;
    client.connect();
    this.send(client.getId(), {
      action: msg.SV_HANDSHAKE,
      id: client.getId()
    });
    this.clientCount++;
    this.broadcast({
      action: msg.SV_SAY,
      message: 'Client (' + client.getId() + ') has connected'
    });
  }

  static received(message) {

    let data = JSON.parse(message);

    if (data.action === msg.CL_SAY) {
      this.broadcast(data);
      return;
    }

    if (data.action === msg.CL_JOIN_ROOM) {

      let room = null;
      if ('roomIndex' in data) {
        room = Server.getRoom(data.roomIndex);
      } else {
        room = Server.getAvailableRoom();
      }

      room.createPlayer(data.playerName);

      Server.send(data.clientId, {
        action: msg.SV_CLIENT_JOINED_ROOM
      });

      return;
    }
  }

  static tick() {

    console.log('tick');

    if (this.rooms.length) {

      this.broadcast({
        action: msg.SV_ROOM_LISTING,
        count: this.getRoomCount(),
        clientCount: this.clientCount,
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
}