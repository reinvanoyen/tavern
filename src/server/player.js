'use strict';

module.exports = class Player {

  constructor(id, name, role) {
    this.id = id;
    this.name = name;
    this.role = role;
    this.isDead = false;
  }

  performAbility(index, data) {
    if (!this.role.abilities[index]) {
      console.error('No ability for that index');
      return;
    }
    this.role.abilities[index].perform(data);
  }
}