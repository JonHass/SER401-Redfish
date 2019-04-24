"use strict";

function PatternFuncs({
  min = 0,
  max = 100,
  step = 1,
  center = 50,
} = {}) {

  this.min = min;
  this.max = max;
  this.step = step;
  this.center = center;

  this.value = this.center;
  this.isRev = false;

  this.patternList = {
    sawtooth: 'Sawtooth',
    pingpong: 'Ping Pong',
    steprand: 'Stepwise Random',
    fullrand: 'Full Random',
    rubberband: 'Rubberband'
  };
};

PatternFuncs.prototype.setStep = function(step) {
  this.step = step;
};

PatternFuncs.prototype.sawtooth = function() {
  this.doStep();
  this.doModulo();

  return this.value;
};

PatternFuncs.prototype.pingpong = function() {
  this.doStep();

  if (this.value > this.max) {
    this.doReverse();
    this.value = this.max - (this.value - this.max);
  } else if (this.value < this.min) {
    this.doReverse();
    this.value = this.min - (this.value - this.min);
  }

  this.doModulo();

  return this.value;
};

PatternFuncs.prototype.fullrand = function() {
  this.value =
    Math.floor(Math.random() * (this.max - this.min + 1)) + this.min;

  return this.value;
};

PatternFuncs.prototype.steprand = function() {
  var step = Math.floor(Math.random() * (this.step * 2 + 1)) - this.step;

  this.value += step;
  if (this.value > this.max) {
    this.value = this.max - (this.value - this.max);
  } else if (this.value < this.min) {
    this.value = this.min - (this.value - this.min);
  }

  return this.value;
};

PatternFuncs.prototype.rubberband = function() {
  var rand = Math.random();
  var oldv = this.value;

  if (this.value < this.center) {
    var percent = (this.value - this.min) / ((this.center - this.min) * 2);
    if (rand < percent) {
      this.value -= this.step * percent;
    } else {
      this.value += this.step * percent;
    }
//    console.log("> (", this.min, " < ", this.center, " < ", this.max, ") -- ", rand.toFixed(3), " <> ", percent.toFixed(3), " == ", oldv.toFixed(3), " -> ", this.value.toFixed(3));
  } else {
    var percent = 1 - (this.max - this.value) / ((this.max - this.center) * 2);
    if (rand < percent) {
      this.value -= this.step * percent;
    } else {
      this.value += this.step * percent;
    }
//    console.log("> (", this.min, " < ", this.center, " < ", this.max, ") -- ", rand.toFixed(3), " <> ", percent.toFixed(3), " == ", oldv.toFixed(3), " -> ", this.value.toFixed(3));
  }

  if (this.value > this.max) {
    this.value = this.max - (this.value - this.max);
  } else if (this.value < this.min) {
    this.value = this.min - (this.value - this.min);
  }

  return this.value;
};

PatternFuncs.prototype.doReverse = function() {
  this.isRev = !this.isRev;
};

PatternFuncs.prototype.doStep = function() {
  this.value += this.step * (this.isRev ? -1 : 1);
};

PatternFuncs.prototype.doModulo = function() {
  this.value = this.modulo(this.value);
};

PatternFuncs.prototype.modulo = function(x) {
  var diff = this.max - this.min + 1;
  x = ((((x - this.min) % diff) + diff) % diff) + this.min;

  return x;
};

module.exports = PatternFuncs;
