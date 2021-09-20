if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const app = express();
//bcrypt: allows hashing password and comparing for authentication
const bcrypt = require('bcrypt');
//save your users in a variable(usually this would be in a database) will be reinitialized everytime you restart server
const users = []

const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');

//install: passport -> used for authentication passport-local: to login using username and passwords as opposed to google..etc to
//express-session: to save user across different pages express-flash: messages displayed for wrong name etc
const passport = require('passport');
const initializePassport = require('./passpoert-config');
initializePassport(
    passport,
     email => users.find(user => user.email === email),
     id => users.find(user => user.id === id),
);

app.set('view-engine','ejs');
//allows us to use the data from the forms in our request object in out post method
app.use(express.urlencoded({extended:false}));
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

app.get('/',checkAuthenticated, (req,res)=>{
console.log("server running on port 3000");
    res.render('index.ejs',{name: req.user.name});
});

app.get('/login', (req,res)=>{
    res.render('login.ejs');
});

app.get('/register', checkNotAuthenticated, (req,res)=>{
    res.render('register.ejs');
    //access name field(from 'name' tag in our form)
    req.body.name
});

//make sure the function is async to be able to use a try catch

app.post('/register',checkNotAuthenticated, async(req,res)=>{
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
        id: Date.now().toString(),
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
        })
        res.redirect('/login');
    } catch {
        res.redirect('/register');
    }
    console.log(users);
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.delete('/logout', (req,res) => {
    req.logout();
    res.redirect('/login');
})

function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    return res.redirect('/login');
}
function checkNotAuthenticated(req,res,next){
     if(req.isAuthenticated()){
        return res.redirect('/');
    }
    next();
}
app.listen(3000);

