'use strict';

const msg = require('../../shared/socket-messages');
const EventManager = require('../../shared/event-manager');

module.exports = class Room {

  build() {

    this.roomContainer = document.createElement('div');

    this.input = document.createElement('input');
    this.roomContainer.appendChild(this.input);

    this.input.addEventListener('keypress', e => {
      if (e.keyCode === 13) {
        EventManager.trigger('sendMessage', {
          message: e.currentTarget.value
        });
        this.input.value = '';
      }
    });

    EventManager.on(msg.CL_SAY, e => {
      this.addMessage(e.clientId, e.message);
    });

    return this.roomContainer;
  }

  addMessage(clientId, message) {
    let messageEl = document.createElement('div');
    messageEl.textContent = clientId + ': ' + message;
    this.roomContainer.appendChild(messageEl);
  }
}