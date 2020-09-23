export default class ServerConnectionScene extends Phaser.Scene {
	constructor(config) {
		super(config);
		this.ws = null;
		this.messageSent = false;
	}

	init() {
		console.log('init on ' + this.scene.key + ' start');
		this.ws = new WebSocket("ws://localhost:8080");
		this.ws.onmessage = this.onmessage;
		console.log(this.ws);
	}

	preload() {
		console.log('preload on ' + this.scene.key + ' start');

	}
	  
	create() {
		console.log('create on ' + this.scene.key + ' start');

	}
	  
	update(timeElapsed, dt) {
		if(!this.messageSent && this.ws.readyState === WebSocket.OPEN)
		{
			console.log('now sending message');
			this.ws.send("hello from server-connection-scene!");
			this.messageSent = true;
		}
	}

	onmessage(e) {
		console.log('message recieved from server: ');
		console.log(e.data);
	}
}

