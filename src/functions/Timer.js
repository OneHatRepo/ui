import prettyMilliseconds from 'pretty-ms';

// From https://stackoverflow.com/a/57981688

// const timer = new Timer();
// timer.start();
// setInterval(() => {
//   const timeInSeconds = Math.round(timer.getTime() / 1000);
//   document.getElementById('time').innerText = timeInSeconds;
// }, 100)

export default class Timer {
	constructor(echo = false) {
		this.echo = echo;
		this.isRunning = false;
		this.startTime = 0;
		this.overallTime = 0;
		this.lapTime = 0;
	}

	_getTimeElapsedSinceLastStart() {
		if (!this.startTime) {
			return 0;
		}

		return Date.now() - this.startTime;
	}

	_getTimeElapsedSinceLastLap() {
		if (!this.lapTime) {
			return 0;
		}

		return Date.now() - this.lapTime;
	}

	start() {
		if (this.isRunning) {
			return console.error('Timer is already running');
		}

		this.isRunning = true;

		this.startTime = Date.now();
	}

	stop() {
		if (!this.isRunning) {
			return console.error('Timer is already stopped');
		}

		this.isRunning = false;

		this.overallTime = this.overallTime + this._getTimeElapsedSinceLastStart();
	}

	reset() {
		this.overallTime = 0;

		if (this.isRunning) {
		this.startTime = Date.now();
			return;
		}

		this.startTime = 0;
	}

	getTime() {
		if (!this.startTime) {
			return 0;
		}

		if (this.isRunning) {
			return this.overallTime + this._getTimeElapsedSinceLastStart();
		}

		return this.overallTime;
	}

	lap(name) {
		const lapTime = this._getTimeElapsedSinceLastLap();
		this.lapTime = Date.now();
		if (this.echo) {
			console.log(name, prettyMilliseconds(lapTime), prettyMilliseconds(this._getTimeElapsedSinceLastStart()));
		}
		return lapTime;
	}

	prettify(ms) {
		return 
	}
}