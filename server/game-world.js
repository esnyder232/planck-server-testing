const planck = require('planck-js');
const {GlobalFuncs} = require('./global-funcs.js');

class GameWorld {
	constructor() {
		this.world = null;		
		this.globalfuncs = new GlobalFuncs();
		this.frameRate = 1; //fps
		this.framePeriod = 1000 / this.frameRate; //ms
		this.isRunning = false;
	}

	create() {
		console.log('creating gameworld now');
		const pl = planck;
		const Vec2 = pl.Vec2;
		
		if(!this.world) {
			this.world = pl.World({
				gravity: Vec2(0, -10)
			});
		
			//origin lines
			var xAxisBody = this.world.createBody({
				position: Vec2(0, 0)
			});
			var xAxisShape = pl.Edge(Vec2(0, 0), Vec2(1, 0));
			xAxisBody.createFixture(xAxisShape);
		
			var yAxisBody = this.world.createBody({
				position: Vec2(0, 0)
			});
			var yAxisShape = pl.Edge(Vec2(0, 0), Vec2(0, 1));
			yAxisBody.createFixture(yAxisShape);
		
			//ground
			var ground = this.world.createBody({
				position: Vec2(0, -10)
			});	
			var groundShape = pl.Box(20, 5, Vec2(0,0));
			ground.createFixture(groundShape, 0);
		
			
			//box
			this.boxBody = this.world.createBody({
				position: Vec2(1, 10),
				type: pl.Body.DYNAMIC
			});
			var boxShape = pl.Box(1, 1);
			this.boxBody.createFixture({
				shape: boxShape,
				density: 1.0,
				friction: 0.3
			});
		
			var boxShape2 = pl.Box(1, 1, Vec2(-1, -1));
			this.boxBody.createFixture({
				shape: boxShape2,
				density: 1000.0,
				friction: 0.3
			});	
		}
		console.log('creating gameworld done');
	}

	onclose(socket, m) {	
		console.log('socket onclose: ' + m);
	}

	onerror(socket, m) {
		console.log('socket onerror: ' + m);
	}

	onpong(socket, m) {
		console.log('socket onpong: ' + m);
	}

	onmessage(socket, m) {
		console.log('socket onmessage: ' + m);
		var jsonMsg = this.globalfuncs.getJsonEvent(m);
		console.log("event is: " + jsonMsg.event + ". msg is: " + jsonMsg.msg);
	
		switch(jsonMsg.event.toLowerCase())
		{
			case "get-world":
				this.getWorld(socket, jsonMsg);
				break;
			case "start-event":
				this.startEvent(socket, jsonMsg);
				break;
			case "stop-event":
				this.stopEvent(socket, jsonMsg);
				break;
			case "restart-event":
				this.restartEvent(socket, jsonMsg);
				break;
			default:
				//just echo something back
				this.globalfuncs.sendJsonEvent(socket, "unknown-event", "Unknown Event");
				break;
		}
	}

	getWorld(socket, jsonMsg) {
		console.log('now getting world');

		var currentBody = this.world.getBodyList();
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

		this.globalfuncs.sendJsonEvent(socket, "get-world-response", JSON.stringify(arrBodies))

		console.log('getting world done')
	}

	startEvent(socket, jsonMsg) {
		console.log('starting simulation');
		this.startGameLoop();
	}
	
	stopEvent(socket, jsonMsg) {
		console.log('stopping simulation');
		this.stopGameLoop();
	}
	
	restartEvent(socket, jsonMsg) {
		console.log('restarting simulation');
	}

	//starts the gameworld game loop
	startGameLoop() {
		if(!this.isRunning)
		{
			this.isRunning = true;
			console.log("Starting game loop");
			this.update(this.framePeriod);
		}
	}

	stopGameLoop() {
		if(this.isRunning)
		{
			this.isRunning = false;
			console.log("Stopping game loop");
		}
	}


	update(dt) {
		//simulate
		var timeStep = 1/60;
		var velocityIterations = 6;
		var positionIterations = 2;
	
		this.world.step(timeStep, velocityIterations, positionIterations);
		var p = this.boxBody.getPosition();
		var a = this.boxBody.getAngle();
		console.log('box position: %s, %s. Angle: %s', p.x, p.y, a);

		//recall update loop
		if(this.isRunning)
		{
			setTimeout(this.update.bind(this, this.framePeriod), this.framePeriod)
		}
	}
}

exports.GameWorld = GameWorld;