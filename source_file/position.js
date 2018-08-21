var Position = 

function (x, y) {
	
	return {
		x: x || 0,
		y: y || 0,
		setPos: function (x, y) {
			if (typeof x !== 'number' || typeof y !== 'number') throw new Error('number required for the pos')
			this.x = x
			this.y = y
		},

		getX: function () {
			return this.x
		},

		getY: function () {
			return this.y
		}
	}
};

module.exports = {
	Position: Position
}