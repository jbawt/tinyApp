const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

// random alphanumeric string
const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

// url storage
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// shows all stored shortened urls corresponding to their long url pairs
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

// renders registration page
app.get("/register", (req, res) => {
  let templateVars = { username: req.cookies.username };
  res.render("user_registration", templateVars);
});

// renders page for creating new shortened url
app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

// renders users logged in and creates cookie
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

// renders page when user logs out and clears cookie
app.post("/logout", (req, res) => {
  res.clearCookie("username", req.body.username);
  res.redirect("/urls");
});

// stores new short url with random key
app.post("/urls", (req, res) => {
  let key = generateRandomString();
  let templateVars = {
    shortURL: key,
    longURL: req.body.longURL,
    username: req.cookies["username"]
  };
  urlDatabase[key] = req.body.longURL;
  res.render("urls_show", templateVars);
});

// renders results for shortened url
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
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
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});