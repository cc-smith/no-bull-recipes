require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');
const cheerio = require('cheerio');
const axios = require("axios")
const nodemailer = require("nodemailer");
const cors = require("cors");
const app = express();

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

// Initialize mongo connection
const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("noBullRecipes").collection("users");
  // perform actions on the collection object
  client.close();
});

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

// Initialize schema for user database
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

app.get("/", function(req, res){
  res.render("login", {layout: 'main-login'});
});

app.get("/login", function(req, res){
  res.render("login", {layout: 'main-login'});
});

app.get("/register", function(req, res){
  res.render("register");
});

app.get("/home", function(req, res){
  data = {
    user: req.user.username
  }
  res.render("home", data)
});

app.use("/home", function(req, res){
  let username = req.user.username
  let url = req.body.url
  let recipeNotes = req.body.recipeNotes

  data = {
          user: req.user.username,
          url: req.body.url,
          recipeNotes:req.body.recipeNotes
        }
  res.render("home", data)
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
  User.findById(req.user.id, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        console.log("**********!!!!!!!!!!!!!*************")
        foundUser.secret = submittedSecret;
        foundUser.save(function(){
          res.redirect("/home");
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
        res.redirect("/home");
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
        res.redirect("/home");
      });
    }
  });

});

/**
 * THe parse route uses 2 strategies to retreive the instructions and ingredients from a recipe website.
 * First, it will try to retrieve the data from a script in the head of the webpage. Script has type='application/ld+json'
 * If this is unsuccessful, it will search within the body of the webpage for the relevant data.
 */
var parseFunctions = require('./public/js/parsingFunctions.js')
app.post('/parse', async function(req, res) {

  // the data which will be displayed to the user after recipe website has been parsed
  var data = {"title":[], "ingredients":[], "instructions":[]}

  // Pass the url to the parsing function to fetch the HTML 
  let url = req.body.url;
  var $ = await parseFunctions.fetchHTML(url)
  
  // Get the title of the recipe
  data["title"] = [$('h1').text()]

  // Get the script that conatins relevant JSON data 
  var jsonScript = $('script[type="application/ld+json"]')


  // Try pulling recipe data from the JSON if possible
  try {
    var jsonScriptParsed = JSON.parse(jsonScript[0].children[0].data)
    if (typeof jsonScriptParsed['@graph'] !== 'undefined' ) { 
      var result = jsonScriptParsed['@graph']
    } else {
      var result = jsonScriptParsed
    }

    parseFunctions.findResults(result)
    if (typeof result.length !== 'undefined') {
      var test = findResults(result)
    }
    else {
      var test = result
    }

    // Relevant data contained within JSON. We will use this strategy for retrieving recipe information
    parseFunctions.getScriptData(test, data)
    console.log("\nParsing Script Text\n")
  }
  
  catch {
    // Could not pull relevant data from JSON. We must fetch data from the body of the web page.
    parseFunctions.getBodyData("ingredients", data, parseFunctions.ingredSearchTerms, $)
    parseFunctions.getBodyData("instructions", data, parseFunctions.instructSearchTerms, $)
    console.log("\n\nParsing Body Text\n")
}
  res.send(data)
});


// Set up our schema for recipes that will be added to users' cookbooks
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

// Route to save recipes in user's cookbook
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

// Route to access user's cookbook
app.get('/my-cookbook', async function(req, res) {
  let username = req.user.username
  const recipes = await Recipe.find({user: username}).sort({"title":1}).lean()
  JSON.stringify(recipes)
  res.render('my-cookbook', {recipes})
});

// Route to delete recipe from cookbook
app.post("/delete-recipe", function(req, res){
  const recipeID = req.body.id
  console.log("Received id to delete:", recipeID)
  Recipe.deleteOne({ _id: recipeID }, function (err) {
    if (err) return console.error(err);
  });
  res.send(recipeID)
});


// Route to email recipe
app.post('/email', async function(req, res) {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'NoBullRecipes.mailer@gmail.com',
      pass: process.env.GMAIL_PW
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