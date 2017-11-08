'use strict';

const Player = require('./player');
const Sheriff = require('./player/role/sheriff');

module.exports = class Room {

  constructor(id) {
    this.id = id;
    this.maxPlayerCount = 5;
    this.currentPlayerId = 0;
    this.players = [];
    this.playerIds = {};
  }

  isFull() {
    return ( this.players.length >= this.maxPlayerCount );
  }

  createPlayer(name) {

    if(this.isFull()) {
      console.error('Couldn\'t create player because the room is full');
      return;
    }

    this.currentPlayerId++;
    let player = new Player(this.currentPlayerId, name, new Sheriff());
    this.players.push(player);
    this.playerIds[player.id] = player;
    console.log('Player added to room: ' + player.name + ' (id: ' + player.id + ')');
    return player;
  }

  getPlayerById(id) {
    return this.playerIds[id];
  }

  getPackageData() {
    return {
      id: this.id,
      isFull: this.isFull(),
      playerCount: this.players.length,
      maxPlayerCount: this.maxPlayerCount
    }
  }
}