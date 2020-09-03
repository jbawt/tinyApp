// ==========  REQUIRES AND MIDDLEWARE ====== //
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080;

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set("view engine", "ejs");
// ==========================================//



// ========= HELPER FUNCTIONS ==============//
// random alphanumeric string
const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

// finds user account info
const findUserByEmail = (email) => {
  for (const userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
  return null;
};

// filters user specific urls
const urlsForUsers = (id) => {
  let userUrls = {};
  for (const urlId in urlDatabase) {
    if (urlDatabase[urlId].userId === id) {
      userUrls[urlId] = urlDatabase[urlId];
    }
  }
  return userUrls;
};
// ========================================= //



// ========= BASE DATA FOR TESTING ======== //
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userId: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userId: "user2RandomID"
  },
  "4sr8th": {
    longURL: "http://facebook.com",
    userId: "user2RandomID"
  }
};

const users = {
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
// ======================================= //



// ========= GET / POST REQUESTS ======== //
// shows main url page with users urls
app.get("/urls", (req, res) => {
  const usersURLS = urlsForUsers(req.cookies.userId);
  const templateVars = {
    urls: usersURLS,
    userId: req.cookies.userId
  };
  res.render("urls_index", templateVars);
});

// renders registration page
app.get("/register", (req, res) => {
  const templateVars = { userId: req.cookies.userId };
  res.render("user_registration", templateVars);
});

// adds users to user obj once registered
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const id = generateRandomString();
  const userId = findUserByEmail(email);

  if (!email || !password) {
    return res.sendStatus(400);
  }
  if (userId !== null) {
    return res.sendStatus(400);
  }
  const newUser = {
    id: id,
    email: email,
    password: password
  };
  users[id] = newUser;

  res.cookie("userId", id);
  res.redirect("/urls");
});

// renders page for creating new shortened url
app.get("/urls/new", (req, res) => {
  const templateVars = { userId: req.cookies.userId };
  for (const id in users) {
    if (templateVars.userId === id) {
      return res.render("urls_new", templateVars);
    }
  }
  res.redirect("/login");
});

// renders users login page
app.get("/login", (req, res) => {
  const templateVars = { userId: req.cookies.userId };
  res.render("user_login", templateVars);
});

// logs in registered users with cookie enabled
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const userId = findUserByEmail(email);

  if (userId === null) {
    return res.sendStatus(403);
  }
  if (userId.email === email && userId.password !== password) {
    return res.sendStatus(403);
  }
  
  res.cookie("userId", userId.id);
  res.redirect("/urls");
});

// renders page when user logs out and clears cookie
app.post("/logout", (req, res) => {
  res.clearCookie("userId", req.body.userId);
  res.redirect("/login");
});

// stores new short url with random key
app.post("/urls", (req, res) => {
  const key = generateRandomString();
  const templateVars = {
    shortURL: key,
    longURL: req.body.longURL,
    userId: req.cookies.userId
  };
  urlDatabase[key] = { longURL: req.body.longURL, userId: req.cookies.userId };
  res.render("urls_show", templateVars);
});

// renders results for shortened url
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    userId: req.cookies.userId
  };
  res.render("urls_show", templateVars);
});


// redirect user to main url through short url
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// deletes stored urls and redirects to main url page
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies.userId) {
    delete urlDatabase[req.params.shortURL];
    return res.redirect("/urls");
  }
  res.sendStatus(403);
});

// edits long urls
app.post("/urls/:id", (req, res) => {
  if (req.cookies.userId) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    return res.redirect("/urls");
  }
  res.sendStatus(403);
});
// ====================================================== //



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});