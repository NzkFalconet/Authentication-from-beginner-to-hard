const express= require('express');
const app = express();

app.set('view engine','ejs');
const bodyparser= require('body-parser');
app.use(bodyparser.urlencoded({extended:true}));
const session = require('express-session')
const passport= require('passport');
const passportLocalMongoose= require('passport-local-mongoose');
var findOrCreate = require('mongoose-findorcreate')

//Connecting to Mongoose
const mongoose = require('mongoose');
const { use } = require('passport');

//Creating a Session
app.use(session({
    secret: 'Our Little Secret',
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: true }
  }))



//Initializing Passport
app.use(passport.initialize());
app.use(passport.session());




mongoose.connect('mongodb://localhost:27017/ShanDB');

//Creating a mongoose Schema
const userSchema= new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    googleId:String,
    facebookId:String
    
})


userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


//Creating a Mongoose Model
const User = new mongoose.model('User',userSchema);

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

// passport.serializeUser(function(user, done) {
//     done(null, user.id);
//   });
  
//   passport.deserializeUser(function(id, done) {
//     User.getUserById(id, function(err, user) {
//       done(err, user);
//     });
//   });


passport.serializeUser(function (user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function (user, done) {
    done(null, user);
  });


// ------------------Google Auth----------------


const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: "589668484178-3ds95d8f086u3i5cgnf3h2jq6ukbie1e.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
  },
  function(accessToken, refreshToken, profile, cb) {
      console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));







// ------------------Google Auth----------------




// ------------------facebook Auth----------------
var FacebookStrategy = require("passport-facebook").Strategy;

passport.use(new FacebookStrategy({
    clientID: 634026394268336,
    clientSecret:  '60dbfcdf6d42af2e1c578994c7a7ecd6',
    callbackURL: "http://localhost:3000/auth/facebook/secrets",
    profileFields: ["id", "emails", "name"],
  },
  function(accessToken, refreshToken, profile, cb) {
      console.log(profile);
    User.findOrCreate({ facebookId:profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/secrets',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log(req.user, req.isAuthenticated());
    res.redirect('/secrets');
  });

// ------------------facebook Auth----------------




//secrets Route
app.get('/secrets',(req,res)=>{
    if(req.isAuthenticated())
    {
        console.log("Request is authenticated!");
        res.render('secrets.ejs');
    }
    else
    {
        console.log("Request is not authenticated! redirecting to login page!");
        res.redirect('/login');
    }
    
});


//Register Route
app.get('/register',(req,res)=>{
    res.render('signup.ejs');
});


//Register Post Route
app.post('/register',(req,res)=>{
    
    
    console.log(req.body);
    User.register({
        username:req.body.username,email:req.body.email,
     },req.body.password,(err,user)=>{
         if(err)
         {
             console.log(err);
             res.redirect('/register');
         }
         else{
             passport.authenticate("local")(req,res,()=>{
                 console.log("it is authenticating!");
                res.redirect('/secrets');
             })
         }
     })
     
   


})

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });


//Login Route
app.get('/login',(req,res)=>{
    res.render('login.ejs');
});



// //Login Post Route
app.post('/login',(req,res)=>{

       const newUser =  User({
        username:req.body.username,
        password:req.body.password
       })

    req.login(newUser, function(err) {
       if (err) { console.log(err); }
       else
       {
        passport.authenticate("local")(req,res,()=>{
            console.log("Login request is authenticating!");
           res.redirect('/secrets');
        })
       }
       
      });


})



app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/login');
  });


app.get('/',(req,res)=>{
    res.render('home.ejs');
})

app.listen(3000,()=>{
    console.log("server started at port 3000!");
});