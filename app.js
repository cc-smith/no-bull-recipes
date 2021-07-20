//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const cheerio = require('cheerio');
const axios = require("axios")
const nodemailer = require("nodemailer");
const app = express();

//handlebars 
const exphbs = require('express-handlebars')
const path = require('path')
const hbs = exphbs.create({
  partialsDir: __dirname + '/views/partials'
})
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"));
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');
////////////////////////////////////////



const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://ccsmith39:cacti6corn@cluster0.jdbpb.mongodb.net/noBullRecipes?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("noBullRecipes").collection("users");
  // perform actions on the collection object
  client.close();
});




// app.use(express.static("public"));
// app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(uri, {useNewUrlParser: true});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  googleId: String,
  secret: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);

    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/", function(req, res){
  res.render("login");
});

app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/secrets",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect("/secrets");
  });

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.get("/secrets", function(req, res){
  User.find({"secret": {$ne: null}}, function(err, foundUsers){
    if (err){
      console.log(err);
    } else {
      if (foundUsers) {
        res.render("secrets", {usersWithSecrets: foundUsers});
      }
    }
  });
});

app.get("/submit", function(req, res){
  if (req.isAuthenticated()){
    res.render("submit");
  } else {
    res.redirect("/login");
  }
});

app.post("/submit", function(req, res){
  const submittedSecret = req.body.secret;

//Once the user is authenticated and their session gets saved, their user details are saved to req.user.
  // console.log(req.user.id);

  User.findById(req.user.id, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.secret = submittedSecret;
        foundUser.save(function(){
          res.redirect("/secrets");
        });
      }
    }
  });
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.post("/register", function(req, res){

  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });

});

app.post("/login", function(req, res){

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });

});

function getSearchData(category, data, searchTerms, $) {
  for (var i = 0; i < searchTerms.length; i++) {
    let term = searchTerms[i]
    let searchResults = $("body").find(term);

    if (searchResults.length !== 0) {
      searchResults.each(function (index, element) {
        data[category].push($(element).text());
      });
      return data
    }
  }
}


async function fetchHTML(url) {
  const { data } = await axios.get(url)
  return cheerio.load(data)
}

app.post('/parse', async function(req, res) {
  let url = req.body.url;
  console.log("received URL:", url)
  const $ = await fetchHTML(url)

  var data = {"title":[], "ingredients":[], "instructions":[]}

  var ingredSearchTerms = ["li[itemprop*='ingredient']", "li[itemprop*='Ingredient']", "span[class*='ingredient']", "span[class*='Ingredient']", "li[class*='ingredient']", "li[class*='Ingredient']", "div[class*='ingredient']", "div[class*='Ingredient']"];

  var instructSearchTerms = ["ol > li", "li[itemprop*='instruction']", "li[itemprop*='Instruction']", "span[class*='instruction']", "span[class*='Instruction']", "li[class*='instruction']", "li[class*='Instruction']", "div[class*='instruction']", "div[class*='Instruction']", "div[class*='preparation']", "div[class*='Preparation']", "div[class*='method']", "div[class*='Method']"];
  
  data["title"] = [$('h1').text()]

  getSearchData("ingredients", data, ingredSearchTerms, $)
  getSearchData("instructions", data, instructSearchTerms, $)
  res.send(data)
})


app.post('/email', async function(req, res) {
  let data = req.body;
  console.log("received email data:\n", data)

  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"No Bull Recipes" <foo@example.com>', // sender address
    to: "bar@example.com, baz@example.com", // list of receivers
    subject: data["title"], // Subject line
    text: data["ingredients"], // plain text body
    html: "<b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

  res.send('Email Sent')
})









let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

console.log("http://localhost:" + port)
app.listen(port, function() {
  console.log("Server started on port 3000.");
});
