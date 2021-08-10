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
const cors = require("cors");
const app = express();

//handlebars 
const exphbs = require('express-handlebars')
const path = require('path')
const hbs = exphbs.create({
  partialsDir: __dirname + '/views/partials'
})
app.use(cors())
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
// var cookieParser = require('cookie-parser')
// app.use(cookieParser())

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false,
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
  res.render("login", {layout: 'main-login'});
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
  res.render("login", {layout: 'main-login'});
});

app.get("/register", function(req, res){
  res.render("register");
});

app.get("/secrets", function(req, res){
  data = {
    user: req.user.username
  }
  res.render("secrets", data)
});


app.use("/secrets", function(req, res){
  let username = req.user.username
  let url = req.body.url
  let recipeNotes = req.body.recipeNotes
  console.log("\n\n\n\nuser:", username)
  console.log(url)
  console.log(recipeNotes)

  data = {
          user: req.user.username,
          url: req.body.url,
          recipeNotes:req.body.recipeNotes
        }
  res.render("secrets", data)

  // window.location = "/secrets"
  // User.find({"secret": {$ne: null}}, function(err, foundUsers){
  //   if (err){
  //     console.log(err);
  //   } else {
  //     if (foundUsers) {
  //       res.render("secrets", {usersWithSecrets: foundUsers});
  //     }
  //   }
  // });
});



app.get("/submit", function(req, res){
  if (req.isAuthenticated()){
    res.render("submit");
  } else {
    res.redirect("/login", {layout: 'main-login'});

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
        // res.render("secrets", {user});

      });
    }
  });

});




// ********************** ORIGINAL **********************
function getSearchData(category, data, searchTerms, $) {
  var test = []
  for (var i = 0; i < searchTerms.length; i++) {
    let term = searchTerms[i]
    let searchResults = $("body").find(term);
    if (searchResults.length !== 0) {
      searchResults.each(function (index, element) {
        test.push($(element).text());
      });
      data[category].push(test);
      return data
    }
  }
}


function getScriptData(result, data) {
  if (typeof result.recipeIngredient !== 'undefined' && typeof result.recipeInstructions !== 'undefined') {
    data["ingredients"].push(result.recipeIngredient)
    var obj = result.recipeInstructions
    function findList(obj) {
      var parent = obj, notFound = true;
      while (notFound) {
          if (typeof obj !== "string") {
              parent = obj
              obj = obj[0]
          } else {
              notFound = false;
          }
      }
      return parent;
    }
    
    // var instructionsList = findList(obj)
    var instructionsList = result.recipeInstructions
    var instructions = []
    for (var i = 0; i < instructionsList.length; i++) {
      if (typeof instructionsList[i].text !== 'undefined') {
        instructions.push(instructionsList[i].text);
      }
      else {
        instructions.push(instructionsList[i]);
      }
    }

    data["instructions"].push(instructions)

    return data

  } else {

  for (var i = 0; i < result.length; i++) {
    let element = result[i]
    
    if (typeof element.recipeIngredient !== 'undefined' ) {
      data["ingredients"].push(element.recipeIngredient)
    };

    if (typeof element.recipeInstructions !== 'undefined' ) {
      for (var i = 0; i < element.recipeInstructions.length; i++) {
        instructions.push(element.recipeInstructions[i].text);
      }
      data["instructions"].push(instructions)
      return data
    };
  }
  return data
  }
}


async function fetchHTML(url) {
  const { data } = await axios.get(url)
  return cheerio.load(data, {
    xml: {
      normalizeWhitespace: true,
    }
  });
}





const ContextParser = require('jsonld-context-parser').ContextParser;

const myParser = new ContextParser();


app.post('/parse', async function(req, res) {
  let url = req.body.url;
  console.log("received URL:", url)

  
  var data = {"title":[], "ingredients":[], "instructions":[]}

  var $ = await fetchHTML(url)
  data["title"] = [$('h1').text()]

  var jsonScript = $('script[type="application/ld+json"]')
  
  try {
    var jsonScriptParsed = JSON.parse(jsonScript[0].children[0].data)
    if (typeof jsonScriptParsed['@graph'] !== 'undefined' ) { 
      var result = jsonScriptParsed['@graph']
    } else {
      var result = jsonScriptParsed
    }
    
    function findResults(result) {
      for (var i = 0; i < result.length; i++) {
        var newResult = result[i]
        if (typeof newResult.recipeIngredient !== 'undefined' && typeof newResult.recipeInstructions !== 'undefined') {
          return newResult
        }
      };
    };
    console.log(result.length, result)
    if (typeof result.length !== 'undefined') {
      var test = findResults(result)
    }
    else {
      var test = result
    }
    getScriptData(test, data)
    console.log("\n\nParsing Script Text\n\n")
  }
  
  catch {
 
    // List of search terms to pass to the filter function
    var ingredSearchTerms = ["span[class*='ingredient'] > p", "ul[class*='ingredient'] > li", "li[itemprop*='ingredient']", "li[itemprop*='Ingredient']", "span[class*='ingredient']", "span[class*='Ingredient']", "li[class*='ingredient']", "li[class*='Ingredient']", "div[class*='ingredient'] > ul > li" , "div[class*='Ingredient']", "label[class*='ingredient']", "section > ul[class*='list'] > li"];

    var instructSearchTerms = ["ol[class*='step'] > li", "ul[class*='Step'] > li", "li[itemprop*='instruction']", "li[itemprop*='Instruction']", "span[class*='instruction']", "span[class*='Instruction']", "li[class*='instruction']", "li[class*='Instruction']", "div[class*='instruction'] > ol > li", "div[class*='Instruction']", "div[class*='preparation']", "div[class*='Preparation']", "div[class*='method']", "div[class*='Method']", "span[class*='direction'] > p", "ul[class*='direction']", "div[class*='direction'] > ol > li","li > p", "div[class*='instruction']", "div > ul > li > p"];

    getSearchData("ingredients", data, ingredSearchTerms, $)
    getSearchData("instructions", data, instructSearchTerms, $)
    console.log("\n\nParsing Body Text\n\n")
}
  

  
  res.send(data)
});



const db = mongoose.connection
const recipeSchema = new mongoose.Schema ({
  user: String,
  title: String,
  host: String,
  url: String,
  ingredients: Array,
  instructions: Array,
  recipeNotes: String
});
const Recipe = new mongoose.model("Recipe", recipeSchema);

app.post("/save", function(req, res){

  const recipe = new Recipe({
    user: req.body.user,
    title: req.body.title,
    host: req.body.host, 
    url: req.body.url,
    ingredients: req.body.ingredients,
    instructions: req.body.instructions,
    recipeNotes: req.body.recipeNotes
  })

  recipe.save(function (err, recipe) {
    if (err) return console.error(err);
  });
  
  res.send(req.body.title)
});


app.get('/my-saved-recipes', async function(req, res) {
  let username = req.user.username
  // const recipes = await Recipe.find({user: username}).lean()
  const recipes = await Recipe.find({user: username}).sort({"title":1}).lean()
  JSON.stringify(recipes)
  console.log(recipes)

  res.render('my-saved-recipes', {recipes})
});

app.post("/delete-recipe", function(req, res){

  const recipeID = req.body.id
  console.log("Received id to delete:", recipeID)
  Recipe.deleteOne({ _id: recipeID }, function (err) {
    if (err) return console.error(err);
  });
  
  res.send(recipeID)
});


app.get('/my-saved-recipes', async function(req, res) {
  let username = req.user.username
  const recipes = await Recipe.find({user: username}).lean()
  JSON.stringify(recipes)

  res.render('my-saved-recipes', {recipes})
});



app.post('/email', async function(req, res) {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'NoBullRecipes.mailer@gmail.com',
      pass: 'nobullshit'
    }
  });
  
  var mailOptions = {
    from: 'NoBullRecipes.mailer@gmail.com',
    to: `${req.body.email}`,
    subject: `${req.body.title} | No Bull Recipes`,
    html: `
          <h2><a href=${req.body.url}>${req.body.title}</a></h2>
          <p>Recipe Notes: ${req.body.recipeNotes}</p>
          <h3>Ingredients:</h3>
          ${req.body.ingredients}
          <h3>Instructions:</h3>
          ${req.body.instructions}
          `
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

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
