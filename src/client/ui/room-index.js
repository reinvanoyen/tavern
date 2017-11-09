'use strict';

const msg = require('../../shared/socket-messages');
const EventManager = require('../../shared/event-manager');

module.exports = class RoomIndex {

  build() {

    this.roomIndex = document.createElement('div');
    this.roomList = document.createElement('ul');
    this.roomIndexTitle = document.createElement('div');

    this.roomIndex.appendChild(this.roomIndexTitle);
    this.roomIndex.appendChild(this.roomList);

    EventManager.on(msg.SV_ROOM_LISTING, e => {
      this.refresh(e);
    });

    return this.roomIndex;
  }

  refresh(data) {

    this.roomIndexTitle.textContent = 'Clients (' + data.clientCount + '), Rooms (' + data.count + ')';
    this.roomList.innerHTML = '';

    data.rooms.forEach( room => {

      let li = document.createElement('li');
      li.textContent = 'Room (id: ' + room.id + ') - (' + room.playerCount + '/' + room.maxPlayerCount + ')';

      let joinBtn = document.createElement('button');

      if (! room.isFull) {

        joinBtn.textContent = 'Join';

        joinBtn.addEventListener('click', e => {

          EventManager.trigger('requestJoinRoom', {
            roomIndex: room.index,
            playerName: prompt('Desired name?')
          });
        });

      } else {
        joinBtn.textContent = 'Full';
      }

      li.appendChild(joinBtn);

      this.roomList.appendChild(li);
    } );
  }
}