const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;

// random alphanumeric string
const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

// url storage
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// shows all stored shortened urls corresponding to their long url pairs
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// renders page for creating new shortened url
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// stores new short url with random key
app.post("/urls", (req, res) => {
  let key = generateRandomString();
  let templateVars = { shortURL: key, longURL: req.body.longURL };
  urlDatabase[key] = req.body.longURL;
  res.render("urls_show", templateVars);
});

// renders results for shortened url
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});


// redirect user to main url through short url
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});