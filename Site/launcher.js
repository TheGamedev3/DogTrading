


// Pick correct .env
const dotenv = require('dotenv');
dotenv.config({path: '.env'});

const express = require('express');
const app = express();

let port = process.env.PORT || 3000;
let link = `http://localhost:${port}`;

const{ onConnect } = require('@MongooseAPI')
onConnect().then(
    ()=>setServer(app.listen(port, () => {
        console.log(`Server is running on ${link}`);
    }))
);

let server; let awaitingServer;
function setServer(s){
    server = s;
    if(awaitingServer)awaitingServer(s);
}

// allow .ejs
const path = require('path')
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// needed for form handling in .ejs
app.use(express.urlencoded({ extended: true }));


// essential starter middleware
const cookieParser = require('cookie-parser');
app.use(express.json());
app.use(cookieParser());

// session is for transfering varaibles to .ejs
const session = require('express-session');

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true
}));


module.exports = {
    app,
    port, link,

    async getServer() {
        if (server) return server;
        return new Promise((resolve) => {
            awaitingServer = resolve;
        });
    }
};

