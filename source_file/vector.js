var tools = require('./tools.js')
var pow = tools.pow
function vector (vx, vy, ax, ay) {
	this.vx = vx || 0;
	this.vy = vy || 0;
	this.ax = ax || 0;
	this.ay = ay || 0;
}

vector.prototype = {

	constructor: vector,

	speedLength: function () {
		return Math.sqrt(pow(this.vx) + pow(this.vy));
	},

	accelerateLength: function () {
		return Math.sqrt(pow(this.ax) + pow(this.ay));
	},

	setSpeed: function (x, y) {
		this.vx = x 
		this.vy = y
	},

	setAccelerate: function (x, y) {
		this.ax = x
		this.ay = y
	}
}


module.exports = vector