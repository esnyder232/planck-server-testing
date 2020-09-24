const planck = require('planck-js');

class GameWorld {
	constructor() {
		this.world = null;
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
			var boxBody = this.world.createBody({
				position: Vec2(1, 10),
				type: pl.Body.DYNAMIC
			});
			var boxShape = pl.Box(1, 1);
			boxBody.createFixture({
				shape: boxShape,
				density: 1.0,
				friction: 0.3
			});
		
			var boxShape2 = pl.Box(1, 1, Vec2(-1, -1));
			boxBody.createFixture({
				shape: boxShape2,
				density: 1000.0,
				friction: 0.3
			});

	
		}

		console.log('creating gameworld done');
	}

	update(dt) {
		//simulate
		var timeStep = 1/60;
		var velocityIterations = 6;
		var positionIterations = 2;
	
		for(var i = 0; i < 360; i++)
		{
			this.world.step(timeStep, velocityIterations, positionIterations);
			var p = boxBody.getPosition();
			var a = boxBody.getAngle();
		}
	}
}

exports.GameWorld = GameWorld;