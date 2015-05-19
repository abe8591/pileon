// Server Events
//import libraries 
var path = require('path');
var http = require ('http');	
var express = require('express');  
var compression = require('compression');  
var favicon = require('serve-favicon'); 
var cookieParser = require('cookie-parser'); 
var bodyParser = require('body-parser'); 
var mongoose = require('mongoose'); 
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var url = require('url');
 
var dbURL = process.env.MONGOLAB_URI || "mongodb://localhost/PileOnDB";

var db = mongoose.connect(dbURL, function(err) {
    if(err) {
        console.log("Could not connect to database");
        throw err;
    }
});

var redisURL = {
    hostname: 'localhost',
    port: 6379
};

var redisPASS;

if(process.env.REDISCLOUD_URL) {
    redisURL = url.parse(process.env.REDISCLOUD_URL);
    redisPASS = redisURL.auth.split(":")[1];
}

//pull in our routes
var router = require('./router.js'); 

var port = process.env.PORT || process.env.NODE_PORT || 3000; 

var app = express(); 
app.use('/assets', express.static(path.resolve(__dirname+'../../client/'))); 
app.use(compression()); 
app.use(bodyParser.urlencoded({ 
  extended: true                
}));                            
app.use(session({
    store: new RedisStore({
        host: redisURL.hostname,
        port: redisURL.port,
        pass: redisPASS
    }),
    secret: 'Empty the Cheons',
    resave: true,
    saveUninitialized: true
}));    
app.set('view engine', 'jade'); 
app.set('views', __dirname + '/views'); 
app.use(favicon(__dirname + '/../client/images/favicon.png')); 
app.use(cookieParser()); 

router(app);

var server = http.createServer(app); 

server.listen(port, function(err) { 
    if (err) {
      throw err;
    }
    console.log('Listening on port ' + port);
});

// usernames which are currently connected to the chat
//var users = [];
//var numUsers = 0;

var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket){
	//socket.on('userJoin', function(username){
		
	//});
	console.log("connection found");
	
	// Send received info to all other users
  	socket.on('new message', function(msg){
		console.log(msg);
		socket.broadcast.emit('receive msg', msg);
	});
  
  	socket.on('update server', function(deckArr){
		console.log(deckArr);
		socket.broadcast.emit('update users', deckArr);
  	});
  
  	// Sort cards on canvas according to specific database info
	// Can't be supported well at this time
  	/*socket.on('alphabet sort', function() {
  
  	});
  
  	socket.on('cmc sort', function() {
  
  	});
  
  	socket.on('color sort', function() {
  
  	});*/
});