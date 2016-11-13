'use strict';

const util = require('util');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

const gpio = require('rpi-gpio');
const SPI = require('pi-spi');

const PIN = {
  BZR_CTRL: 17,
  LED_CTRL: 18,
  DOOR_CTRL: 23,
  SIG_IRQ: 22
};

function Raspid(options) {
  this._spi = null;
  this.options = (options) ? options : {};
  this.version = '';
  this.uuid = '';

  try {
    this.version = fs.readFileSync('/proc/device-tree/hat/product_ver');
    this.uuid = fs.readFileSync('/proc/device-tree/hat/uuid');
  }
  catch (e) {
  }

  gpio.setMode(gpio.MODE_BCM);
  gpio.setup(PIN.BZR_CTRL, gpio.DIR_OUT);
  gpio.setup(PIN.LED_CTRL, gpio.DIR_OUT);
  gpio.setup(PIN.DOOR_CTRL, gpio.DIR_OUT);
  gpio.setup(PIN.SIG_IRQ, gpio.DIR_IN, gpio.EDGE_RISING);

  this._spi = SPI.initialize(this.options.spidev || '/dev/spidev0.0');
  this._spi.clockSpeed(this.options.spispeedhz || 4096);

  EventEmitter.call(this);

  gpio.on('change', (channel, value) => {
    if (channel == PIN.SIG_IRQ && value) {
      this._spi.read(8, (err, data) => {
        if (err) throw err;

        let vals = Array.from(data.values());
        let len = vals.shift();
        let id = vals.splice(0, len).reverse();

        id.length && this.emit('idcard', id);
      });
    }
  });

  this.on('doorOpen', function () {
    gpio.write(PIN.DOOR_CTRL, 1);
  });

  this.on('doorClose', function () {
    gpio.write(PIN.DOOR_CTRL, 0);
  });
}

Raspid.prototype.openDoor = function openDoor(duration, callback) {
  if (duration < 500) {
    duration = 500;
  }

  process.nextTick(() => {
    this.emit('doorOpen');

    setTimeout(() => {
      this.emit('doorClose');
      typeof callback == 'function' && callback();
    }, duration);
  });
};

util.inherits(Raspid, EventEmitter);

module.exports = function newInstance(options) {
  return new Raspid(options);
};

module.exports.Raspid = Raspid;
