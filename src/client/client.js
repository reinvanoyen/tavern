'use strict';

const msg = require('../shared/socket-messages');
const EventManager = require('../shared/event-manager');

module.exports = class Client {

  constructor() {

    this.id = null;
    this.connection = null;
    this.isConnected = false;
  }

  connect() {

    this.connection = new WebSocket('ws://localhost:8080');
    EventManager.trigger('joining');

    this.connection.onopen = () => {
      this.isConnected = true;
      EventManager.trigger('connected');
    };

    this.connection.onerror = (error) => {
      console.error(error);
      this.isConnected = false;
      EventManager.trigger('couldNotConnect');
    };

    this.connection.onmessage = (message) => {
      this.received(message);
    };
  }

  send(data) {
    if (this.isConnected && this.id) {
      data.clientId = this.id;
      this.connection.send(JSON.stringify(data));
    } else {
      console.error('No can do');
    }
  }

  received(message) {

    let data = JSON.parse(message.data);

    if (data.action === 'handshake') {
      this.id = data.id;
    }

    if (this.id) {
      if (data.action === 'roomIndex') {

        EventManager.trigger('receivedRoomIndex', {
          count: data.count,
          rooms: data.rooms
        });
      }

      if (data.action === msg.SERVER_MESSAGE) {

        EventManager.trigger('receivedServerMessage', {
          message: data.message
        });
      }
    }
  }
}