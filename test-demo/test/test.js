var assert = require('assert');
// var add = require('../add.js').add;
// var mul = require('../add.js').mul;
import { add, mul } from '../add.js';

it('should return -1 when the value is not present', function() {
  assert.equal(add(1, 2), 3);
});

it('should return 24 when the value is not present', function() {
  assert.equal(mul(12, 2), 24);
});