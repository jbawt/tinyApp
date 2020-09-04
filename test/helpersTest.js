const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    
    assert.equal(expectedOutput, user.id);
  });
  
  it('should return undefined if email does not exist', function() {
    const user = findUserByEmail("hellothere@gmail.com", testUsers);
    const expectedOutput = undefined;
    
    assert.equal(expectedOutput, user);
  });
});