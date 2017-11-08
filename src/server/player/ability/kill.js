'use strict';

const Ability = require('./ability');

module.exports = class Kill extends Ability {

  perform(data) {
    console.log('Go kill player with id ' + data.player);
  }
}