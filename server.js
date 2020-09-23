const express = require('express');
const path = require('path');
const WebSocket = require('ws');
const app = express();

const port = 8080;


//create headless websocket server
const wssConfig = {
	noServer: true,
	clientTracking: true
}

const wss = new WebSocket.Server(wssConfig);

//create http server
const server = app.listen(port, () => {console.log('Webserver listening on port %s', port)});


//adding basic http endpoints
app.get('/', (req, res) => {res.sendFile(path.join(__dirname, "index.html"));});
app.get('/index.html', (req, res) => {res.sendFile(path.join(__dirname, "index.html"));});

//static files
app.use('/assets', express.static(path.join(__dirname, "assets")));
app.use('/client-dist', express.static(path.join(__dirname, "client-dist")));

//create http endpoint to do websocket handshake
server.on('upgrade', (req, socket, head) => {
	console.log('Someone is connectiong with websockets. Handling websocket handshake...');
	return wss.handleUpgrade(req, socket, head, socket => {
		console.log('Websocket connected!');
		socket.on("close", onclose);
		socket.on("error", onerror);
		socket.on("message", onmessage);
		socket.on("ping", onping);
		socket.on("pong", onpong);
	})
})



function onclose(m) {
	console.log('socket onclose: ' + m);
}
function onerror(m) {
	console.log('socket onerror: ' + m);
}
function onmessage(m, a, b) {
	console.log('socket onmessage: ' + m);
	this.send("hello back from the server!");
}
function onping(m) {
	console.log('socket onping: ' + m);
}
function onpong(m) {
	console.log('socket onpong: ' + m);
}

