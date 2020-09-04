// random alphanumeric string
const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

// finds user account info
const findUserByEmail = (email, database) => {
  for (const userID in database) {
    if (database[userID].email === email) {
      return database[userID];
    }
  }
  return null;
};

// filters user specific urls
const urlsForUsers = (id, database) => {
  let userUrls = {};
  for (const urlId in database) {
    if (database[urlId].userId === id) {
      userUrls[urlId] = database[urlId];
    }
  }
  return userUrls;
};

module.exports = { 
  findUserByEmail,
  urlsForUsers,
  generateRandomString
};