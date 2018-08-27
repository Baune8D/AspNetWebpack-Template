/* This file can be accessed with the alias: Modules/utilities */

import $ from 'jquery';

export function parseBool(object) {
  return String(object).toLowerCase() === 'true';
}

class Value {
  constructor(value) {
    this.value = value;
  }

  asString() {
    return this.value;
  }

  asBool() {
    return parseBool(this.value);
  }

  asInt() {
    return parseInt(this.value, 10);
  }

  asJson() {
    return JSON.parse(this.value);
  }
}

export function getValue(selector) {
  return new Value($(selector).val());
}
