'use strict';

const Role = require('./role');
const Kill = require('../ability/kill');

module.exports = class Sheriff extends Role {

  get name() {
    return 'The Sheriff';
  }

  get abilities() {
    return [
      new Kill()
    ];
  }
}