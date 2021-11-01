const express= require('express');
const app = express();

app.set('view engine','ejs');
const bodyparser= require('body-parser');
app.use(bodyparser.urlencoded({extended:true}));

//Connecting to Mongoose
const mongoose = require('mongoose');
const { use } = require('passport');
mongoose.connect('mongodb://localhost:27017/ShanDB');

//Creating a mongoose Schema
const userSchema= mongoose.Schema({
    name:{
        require:true,
        type:String
    },
    email:{
        require:true,
        type:String
    },
    password:{
        require:true,
        type:String
    },
})

//Creating a Mongoose Model
const User = new mongoose.model('User',userSchema);


//Register Route
app.get('/register',(req,res)=>{
    res.render('signup.ejs');
});


//Register Post Route
app.post('/register',(req,res)=>{
    console.log(req.body);

    //Creating a new Document 
    const newUser= new User({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password

    })

    //Saving the document to database
    newUser.save((err)=>{
        if(err)
        {
            console.log(err);
        }
        else
        {
            console.log("User Successfully Stored in DataBase");
        }
    })
    //After Succefully registration, use redirects on login page
    res.redirect('/login');

})



//Login Route
app.get('/login',(req,res)=>{
    res.render('login.ejs');
});

//Login Post Route
app.post('/login',(req,res)=>{

     //Creating a new Document 
     const newUser= new User({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password

    })
    //Checking if the document already exists in database or not
    User.findOne({email:req.body.email},(err,foundUser)=>{
        if(err)
        {
            console.log(err);
            res.redirect('/login');
        }
        else if(!foundUser)
        {
            console.log("no account found!");
            res.redirect('/login');
        }
       else if(foundUser.password==newUser.password)
        {
            console.log("Details are correct, redirecting to secrets page!");
            res.render('secrets');
        }
        else if(foundUser.password!=newUser.password)
        {
            console.log("password incorrect! please fill the right passowrd!");
            res.redirect('/login');
        }
    })
})

app.listen(3000,()=>{
    console.log("server started at port 3000!");
});