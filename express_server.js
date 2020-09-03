const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080;

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set("view engine", "ejs");

// random alphanumeric string
const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

// finds stored emails
const findUserByEmail = (email) => {
  for (const userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
  return null;
};

// url storage
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userId: "userRandonID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userId: "user2RandomID"
  }
};

// registered users
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

// shows all stored shortened urls corresponding to their long url pairs
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    userId: req.cookies.userId
  };
  res.render("urls_index", templateVars);
});

// renders registration page
app.get("/register", (req, res) => {
  let templateVars = { userId: req.cookies.userId };
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

// renders users logged in and creates cookie
app.get("/login", (req, res) => {
  let templateVars = { userId: req.cookies.userId };
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
  let key = generateRandomString();
  let templateVars = {
    shortURL: key,
    longURL: req.body.longURL,
    userId: req.cookies.userId
  };
  urlDatabase[key] = { longURL: req.body.longURL, userId: req.cookies.userId };
  console.log(urlDatabase);
  res.render("urls_show", templateVars);
});

// renders results for shortened url
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
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
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// edits long urls
app.post("/urls/:id", (req, res) => {
  const templateVars = { userId: req.cookies.userId};
  for (const id in users) {
    if (templateVars.userId === id) {
      urlDatabase[req.params.id].longURL = req.body.longURL;
      return res.redirect("/urls");
    }
  }
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});