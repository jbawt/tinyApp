// ==========  REQUIRES AND MIDDLEWARE ====== //
const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const {
  findUserByEmail,
  urlsForUsers,
  generateRandomString
} = require('./helpers');

const app = express();
const PORT = 8080;

app.use(cookieSession({
  name: 'session',
  keys: ['secretKey']
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set("view engine", "ejs");
// ==========================================//


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
    longURL: "http://www.facebook.com",
    userId: "user2RandomID"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};
// ======================================= //



// ========= GET / POST REQUESTS ======== //
// renders 403 error code page
app.get("/error403", (req, res) => {
  const templateVars = { user: users[req.session.userId] };
  res.render("403_error", templateVars);
});

// renders 400 error code page
app.get("/error400", (req, res) => {
  const templateVars = { user: users[req.session.userId] };
  res.render("400_error", templateVars);
});

// redirects to login page upon open or urls page if logged in
app.get("/", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/urls");
  }
  res.redirect("/login");
});

// shows main url page with users urls
app.get("/urls", (req, res) => {
  const usersURLS = urlsForUsers(req.session.userId, urlDatabase);
  const keysId = Object.keys(usersURLS);
  const templateVars = {
    urlInDatabase: usersURLS,
    keys: keysId,
    user: users[req.session.userId],
  };
  res.render("urls_index", templateVars);
});

// renders registration page
app.get("/register", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/urls");
  }
  const templateVars = { user: users[req.session.userId] };
  res.render("user_registration", templateVars);
});

// adds users to user obj once registered
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomString();
  const user = findUserByEmail(email, users);

  if (!email || !password) {
    return res.redirect("/error400");
  }
  if (user !== null) {
    return res.redirect("/error400");
  }
  const newUser = {
    id: id,
    email: email,
    password: hashedPassword
  };
  users[id] = newUser;

  req.session.userId = id;
  res.redirect("/urls");
});

// renders page for creating new shortened url
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session.userId] };
  if (templateVars.user) {
    for (const id in users) {
      if (templateVars.user.id === id) {
        return res.render("urls_new", templateVars);
      }
    }
  }
  res.redirect("/login");
});

// renders users login page
app.get("/login", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: users[req.session.userId]
  };
  res.render("user_login", templateVars);
});

// logs in registered users with cookie enabled
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(email, users);

  if (user === null) {
    return res.redirect("/error403");
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res.redirect("/error403");
  }
  
  req.session.userId = user.id;
  res.redirect("/urls");
});

// renders page when user logs out and clears cookie
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// stores new short url with random key
app.post("/urls", (req, res) => {
  const key = generateRandomString();
  const templateVars = {
    shortURL: key,
    longURL: req.body.longURL,
    user: users[req.session.userId]
  };
  urlDatabase[key] = { longURL: req.body.longURL, userId: req.session.userId };
  res.render("urls_show", templateVars);
});

// renders results for shortened url
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.userId]
  };
  res.render("urls_show", templateVars);
});

// redirect user to main url through short url
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (!longURL.includes("http://")) {
    let newUrl = "http://" + longURL;
    return res.redirect(newUrl);
  }
  res.redirect(longURL);
});

// deletes stored urls and redirects to main url page
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.userId) {
    delete urlDatabase[req.params.shortURL];
    return res.redirect("/urls");
  }
  res.redirect("/error403");
});

// edits long urls
app.post("/urls/:id", (req, res) => {
  if (req.session.userId) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    return res.redirect("/urls");
  }
  res.redirect("/error403");
});
// ====================================================== //


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});