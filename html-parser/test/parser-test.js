var assert = require('assert');

import { add } from '../src/parser.js';

describe('Test result:', function() {
  it('test', function() {
    
    assert.equal(add(1, 2), 3);
  });
})
