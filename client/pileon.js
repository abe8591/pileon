// pileon.js

"use strict";
var canvas = 0;
var ctx = 0;
var xOffset = 0;
var chatArr = [];
var deckArr = [];
var currX = 0;
var currY = 0;
var count = 0;

var socket = 0;

// Setup canvas, socket events, and user events
$(document).ready(function() {
	socket = io.connect('http://localhost:3000/');
	canvas = document.querySelector('#canvas');
	ctx = canvas.getContext('2d');
	ctx.strokeStyle = "black";
	ctx.globalAlpha = 1.0;
	ctx.lineWidth = 1;
	xOffset = canvas.width / 6;
	for(var i = 1; i < 7; i++) {
		if(i < 6) {
			ctx.beginPath();
			ctx.moveTo(xOffset * i, 0);
			ctx.lineTo(xOffset * i, canvas.height);
			ctx.stroke();
		}
	}
	
	socket.on('receive msg', receiveMsg);
	socket.on('update users', updateCanvas);
	socket.on('connect',function(){
   		//socket.emit('new message', 'Hello server');
  	});
	socket.on('error', function(errorObj){
		console.log("error occurred");
	});
    $("#submitmsg").on("click", function(e) {
        e.preventDefault();
		// Update chat element list, cycle if over 10 messages
		refreshChat();
		
		// Set up chat message to add to user's html and to send off as an object to server
    	var username = "Test";
		var chatbox = document.querySelector('#chatbox');
		var newMsg = document.createElement('li');
		var msg = document.querySelector('#usermsg').value;
		var textnode = document.createTextNode(msg); 
		newMsg.appendChild(textnode);
		var time = new Date();
		var currTime = time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
		newMsg.innerHTML = username + " ( " + currTime + " ): " + msg;
		chatbox.appendChild(newMsg);
		chatArr.push(newMsg);
		
		var newMessage = {
			user: username,
			message: msg,
			time: currTime
		};
        //socket.emit('new message', 'Hello server');
       	socket.emit('new message', JSON.stringify(newMessage) );
    });
});

// Server message response
function receiveMsg(msg) { 	
	console.log(msg);
	msg = JSON.parse(msg);
	var chatbox = document.querySelector('#chatbox');
	var newMsg = document.createElement('li');
	var message = msg.message;
	var username = msg.user;
	var textnode = document.createTextNode(message); 
	newMsg.appendChild(textnode);
	var time = msg.time;
	newMsg.innerHTML = username + " ( " + time + " ): " + message;
	chatbox.appendChild(newMsg);
	chatArr.push(newMsg);
	
	refreshChat();
}

// Server event response
function updateCanvas(arrUpdate) {
	arrUpdate = JSON.parse(arrUpdate);
	ctx.clearRect(0,0,canvas.width,canvas.height);
	deckArr = arrUpdate.deck;
	for(var i = 1; i < 7; i++) {
		if(i < 6) {
			ctx.beginPath();
			ctx.moveTo(xOffset * i, 0);
			ctx.lineTo(xOffset * i, canvas.height);
			ctx.stroke();
		}
	}
	
	for (var i = 0; i < deckArr.length; deck++) {
		ctx.drawImage(deckArr[i].src, deckArr[i].x, deckArr[i].y);
	}
}

// Drag events
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("image", ev.target.src);
}

// Canvas Redraw
function refreshScreen() {
	ctx.clearRect(0,0,canvas.width,canvas.height);
	
	for(var i = 1; i < 7; i++) {
		if(i < 6) {
			ctx.beginPath();
			ctx.moveTo(xOffset * i, 0);
			ctx.lineTo(xOffset * i, canvas.height);
			ctx.stroke();
		}
	}
	
	for(var j = 0; j < deckArr.length; j++) {
		ctx.drawImage(deckArr[i], deckArr[i].x, deckArr[i].y, deckArr[i].width, deckArr[i].height);
	}
};

// Card Helpers
function placeCard(ev) {
    ev.preventDefault();
	
	console.log(ev);

	var img = document.querySelector('#card');
	var card = img.cloneNode(true);
	card.id = 'image' + count;
	count++;
	card.x = ev.x;
	card.y = ev.y;
	deckArr.push(card);
	ctx.drawImage(card, ev.x - ev.target.offsetLeft, ev.y - ev.target.offsetTop, card.width *= .3, card.height *= .25);
	
	
	var deckObj = {
		deck: deckArr	
	};
	
	console.log(deckObj);
	
	socket.emit('update server', JSON.stringify(deckObj));
}

function moveCard(cardObj, x, y) {
	var card = findCard(cardObj);
		
	if(card != null) {
		card.x = x;
		card.y = y;
	}
	
	socket.emit('update server', deckArr);
}

function removeObj(cardObj) {
	var card = findCard(cardObj);
	
	if(card != null) {
		deckArr.splice(deckArr.indexOf(card), 1);
	}
	
	socket.emit('update server', deckArr);
}

function findCard(cardObj) {
	var foundCard;
	for ( var i = 0; i < deckArr.length; i++ ) {
		if(cardObj.name == deckArr[i].name) {
			foundCard = deckArr[i];
		}
	}
	
	return foundCard;
}

// Chat Helper 
function refreshChat() {
	if(chatArr.length > 10) {
		var removedMsg = chatArr.splice(0, 1)[0];
		console.log(removedMsg);
		document.querySelector('#chatbox').removeChild(removedMsg);
			
		for (var i = 0; i < chatArr.length; i++ ) {
			chatArr[i].id = 'message' + i;
		}
	}
}