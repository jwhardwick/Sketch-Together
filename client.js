const express = require('express')
const app = express()
const WebSocket = require('ws')

app.use('/', express.static(__dirname + '/'))

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html')
})

app.listen(8080, function () {
    console.log("Client.js listening at http://localhost:8080")
})

// // Create a socket instance
// var socket = new WebSocket('ws://localhost:8082/echo');
//
// Open the socket
// socket.onopen = function(event) {
//
// 	// Send an initial message
// 	socket.send('I am the client and I\'m listening!');
//
// 	// Listen for messages
// 	socket.onmessage = function(event) {
// 		console.log('Client received a message',event.data);
// 	};
//
// 	// Listen for socket closes
// 	socket.onclose = function(event) {
// 		console.log('Client notified socket has closed',event);
// 	};
//
// 	// To close the socket....
// 	//socket.close()
//
// };
