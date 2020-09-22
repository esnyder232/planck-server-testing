export default class WebSocketTest {
	constructor() {
		this.url = 'wss://echo.websocket.org'
		this.ws = new WebSocket(this.url);

		this.ws.onopen = this.onopen.bind(this);
		this.ws.onerror = this.onerror.bind(this);
		
		this.ws.onmessage = this.onmessage.bind(this);
		this.ws.onclose = this.onclose.bind(this);
		console.log(this.ws.open);

		window.setTimeout(() => {
			console.log('====== now tryign to send message 1s later');
			this.ws.send('hello from 1s later');
		}, 1000)

		window.setTimeout(() => {
			console.log('====== now closing connect 2s later');
			this.ws.close();
		}, 2000)

		window.setTimeout(() => {
			console.log('====== now tryign to send message 3s later');
			this.ws.send('hello from 3s later');
		}, 3000)

		window.setTimeout(() => {
			console.log('====== now remaking websocket 4s later');
			this.ws = new WebSocket(this.url);
			this.ws.onopen = this.onopen.bind(this);
			this.ws.onerror = this.onerror.bind(this);
			
			this.ws.onmessage = this.onmessage.bind(this);
			this.ws.onclose = this.onclose.bind(this);
		}, 4000)

		window.setTimeout(() => {
			console.log('====== now tryign to send message 5s later');
			this.ws.send('hello from 5s later');
		}, 5000)
	}

	onopen(e) {
		console.log('now sending ping');
		this.ws.send('Hello thar!');
		console.log('ping sent!');
		console.log(this.ws.bufferedAmount);
		console.log(e);
		console.log(this.ws);
	}

	onerror(e) {
		console.log('websocket error: ');
		console.log(e);
		console.log(e.data);
		console.log(this.ws.bufferedAmount);
		console.log(this.ws);
	}

	onmessage(e) {
		console.log('messaged recieved from server: ');
		console.log(e);
		console.log(this.ws.bufferedAmount);
		console.log(this.ws);
	}

	onclose(e) {
		console.log('connection closed!')
		console.log(e);
	}
}