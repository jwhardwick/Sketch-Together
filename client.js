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
