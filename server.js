const express = require('express');
const path = require('path');
const WebSocket = require('ws');
const {GameWorld} = require("./server/game-world.js");
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
		socket.on("message", onmessage.bind(this, socket));
		socket.on("pong", onpong);
		socket.ping("this is a ping");
	})
})



function onclose(m) {
	console.log('socket onclose: ' + m);
}
function onerror(m) {
	console.log('socket onerror: ' + m);
}
function onmessage(socket, m) {
	console.log('socket onmessage: ' + m);
	var jsonMsg = getJsonEvent(m);
	console.log("event is: " + jsonMsg.event + ". msg is: " + jsonMsg.msg);

	if(jsonMsg.event.toLowerCase() == "get-world") {
		//return planck world's stuff
		console.log('now getting world');

		var currentBody = gw.world.getBodyList();
		var arrBodies = [];
		var bodyIDCounter = 1;
		var fixtureIDCounter = 1;
		while(currentBody)
		{

			var bodyObj = {
				id: bodyIDCounter,
				x: 0,
				y: 0,
				fixtures: []
			};

			var pos = currentBody.getPosition();
			bodyObj.x = pos.x;
			bodyObj.y = pos.y;

			var currentFixture = currentBody.getFixtureList();
			while(currentFixture)
			{
				var shape = currentFixture.getShape();
				var vertices = [];
				switch(currentFixture.getType().toLowerCase())
				{
					case "polygon":
						for(var i = 0; i < shape.m_vertices.length; i++)
						{
							var v = {
								x: shape.m_vertices[i].x,
								y: shape.m_vertices[i].y
							};
							vertices.push(v)
						}
						break;
					case "edge":
						var v1 = {
							x: shape.m_vertex1.x,
							y: shape.m_vertex1.y
						};
						var v2 = {
							x: shape.m_vertex2.x,
							y: shape.m_vertex2.y
						};
						vertices.push(v1);
						vertices.push(v2);
						break;
					default:
						break;
				}
				

				var fixtureObj = {
					id: fixtureIDCounter,
					shapeType: currentFixture.getType(),
					radius: shape.getRadius(),
					vertices: vertices
				}

				bodyObj.fixtures.push(fixtureObj);
				currentFixture = currentFixture.getNext();
				fixtureIDCounter++;
			}

			

			arrBodies.push(bodyObj);
			currentBody = currentBody.getNext();
			bodyIDCounter++;
		}

		sendJsonEvent(socket, "get-world-response", JSON.stringify(arrBodies))

		console.log('getting world done')
	}
	else {
		//just echo something back
		sendJsonEvent(socket, "echoback", "hello back from the server!");
	}
}
function onpong(m) {
	console.log('socket onpong: ' + m);
}

//make a example game world
var gw = new GameWorld();
gw.create();


//a quick function to add some structure to the messages going across websockets
function sendJsonEvent(socket, event, msg) {
	if(!event)
	{
		event = "unknown"
	}
	if(!msg)
	{
		msg = ""
	}
	
	var data = {
		event: event,
		msg: msg
	}
	socket.send(JSON.stringify(data));
}

function getJsonEvent(msg) {
	var j = {};
	if(!msg)
	{
		return j;
	}

	j = JSON.parse(msg);
	return j;
}