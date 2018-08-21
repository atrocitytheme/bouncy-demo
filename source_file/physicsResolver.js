
var engine = null; // pys instance
var abs = Math.abs

exports.calculateNormal = function (item) {

	var g = engine.target.g;

	var vector = item.vector

	var ax = vector.ax
	var ay = vector.ay

	var newVx = ax + vector.vx;
	var newVy = ay + vector.vy;

	if (newVy == 0) newVy += ay;

	vector.setSpeed(newVx, newVy);
	// console.log('newVy:...' + newVy);
	var vx = vector.vx;
	var vy = vector.vy;

	var position = {
		x: item.pos.getX(),
		y: item.pos.getY()
	}

	item.setPos(position.x + vx, position.y + vy, true);
}
// @param state {String} upright, horizontal, both
exports.resolveDisplacement = function (state, item) {
		var posX = item.pos.getX();
		var posY = item.pos.getY();
		var displace = item.displace()

		var bottom, ceiling, leftBorder, rightBorder;

		var centerY = item.getCenter().y
		var centerX = item.getCenter().x

		var groundHeight = item.__belong.ground.height
		var groundWidth = item.__belong.ground.width

		var shape = item.form

		if (shape === 'rectangle'){

			  bottom = centerY + item.height/2
			  ceiling = centerY - item.height/2
			  leftBorder = centerX - item.width/2
			  rightBorder = centerX + item.width/2

			if (state === 'upright'){
				if (bottom > groundHeight) {
					posY = posY + displace.down
					item.setPos(posX, posY,true)
				}

				if (ceiling < 0) {
					posY = posY + displace.up
					item.setPos(posX, posY, true)
				}
			}

			if (state === 'horizontal') {
				if (leftBorder < 0) {
					posX = posX + displace.left
					item.setPos(posX, posY, true)
				}

				if (rightBorder > groundWidth) {
					posX = posX + displace.right
					item.setPos(posX, posY, true)
				}
			}

			if (state === 'both') {
				if (leftBorder < 0) {
					posX = posX + displace.left
					item.setPos(posX, posY, true)
				}

				if (rightBorder > groundWidth) {
					posX = posX + displace.right
					item.setPos(posX, posY, true)
				}

				if (bottom > groundHeight) {
					posY = posY + displace.down
					item.setPos(posX, posY,true)
				}

				if (ceiling < 0) {
					posY = posY + displace.up
					item.setPos(posX, posY, true)
				}
			}
		}

		if (shape === 'triangle'){
			if (state === 'upright'){
				if (bottom > groundHeight) {
					posY = posY + displace.down
					item.setPos(posX, posY,true)
				}
			}
		}


		if (shape === 'circle'){
			  bottom = centerY + item.radius
			  ceiling = centerY - item.radius
			  leftBorder = centerX - item.radius
			  rightBorder = centerX + item.radius

			if (state === 'upright'){
				if (bottom > groundHeight) {
					posY = posY + displace.down
					item.setPos(posX, posY,true)
				}

				if (ceiling < 0) {
					posY = posY + displace.up
					item.setPos(posX, posY, true)
				}
			}

			if (state === 'horizontal') {
				if (leftBorder < 0) {
					posX = posX + displace.left
					item.setPos(posX, posY, true)
				}

				if (rightBorder > groundWidth) {
					posX = posX + displace.right
					item.setPos(posX, posY, true)
				}
			}

			if (state === 'both') {
				if (leftBorder < 0) {
					posX = posX + displace.left
					item.setPos(posX, posY, true)
				}

				if (rightBorder > groundWidth) {
					posX = posX + displace.right
					item.setPos(posX, posY, true)
				}

				if (bottom > groundHeight) {
					posY = posY + displace.down
					item.setPos(posX, posY,true)
				}

				if (ceiling < 0) {
					posY = posY + displace.up
					item.setPos(posX, posY, true)
				}
			}
		}

}

exports.render = function (prop) {
	prop.render();
}

exports.load = function (target) {
	engine = target;
}


exports.detectCollide = function (item) {

	var isCollidingWithWorld = item.detectCollideWithWorld();
	
	if (isCollidingWithWorld) {
		var state = isCollidingWithWorld
		// console.log(state);
		engine.emit('collideWithWorld', item, engine, exports, state);
	}

	var possibleObjectsColliding = item.macroCollideDetect()

	possibleObjectsColliding.forEach(function (other) {
		var state = item.detectCollideState(other.shapeObj)
		
		if (item.check_status == true) {
			console.log(state)
		}

		if (state) engine.emit('collideWithObject', item, other.shapeObj, engine, exports, state)
	})

	engine.target.refresh()
	// console.log(possibleObjectsColliding)
}

exports.resolveCollidingWithWorld = function (item, state) { // 优化碰撞

	var dense = item.dense;
	var mass = item.mass;
	var type = item.form;
	var x = item.vector.vx;
	var y = item.vector.vy;
	var ax = item.vector.ax;
	var ay = item.vector.ay;


	switch (type) { // calculate out displace next time
		case 'rectangle':
			if (state === 'both') {
				x = -x;
				y = -y;

				item.vector.setSpeed(x, y);

				exports.resolveDisplacement('both', item);
			}

			if (state === 'horizontal') {
				x = -x;
				y = y;

				item.vector.setSpeed(x, y);

				exports.resolveDisplacement('horizontal', item);

				// console.log(item.vector)
			}

			if (state === 'upright') {
				x = x;
				y = -y

				item.vector.setSpeed(x, y);

				exports.resolveDisplacement('upright', item);

				// console.log(item.vector);
			}

		break;

		case 'triangle':

		break;

		case 'circle':
			if (state === 'both') {
				x = -x;
				y = -y;

				item.vector.setSpeed(x, y);

				exports.resolveDisplacement('both', item);
			}

			if (state === 'horizontal') {
				x = -x;
				y = y;

				item.vector.setSpeed(x, y);

				exports.resolveDisplacement('horizontal', item);


				// console.log(item.vector)
			}

			if (state === 'upright') {
				x = x;
				y = -y

				item.vector.setSpeed(x, y);

				exports.resolveDisplacement('upright', item);
				
				// console.log(item.vector);
			}
		break;
	}

}

exports.resolveObjectDisplacement = function (state, item, other) {//改造这个判定
		var posX = item.pos.getX();
		var posY = item.pos.getY();
		var displace = item.displace(other)

		var bottom, ceiling, leftBorder, rightBorder;

		var centerY = item.getCenter().y
		var centerX = item.getCenter().x

		var groundHeight = other.y // revise here
		var groundWidth = other.x
		var groundBottom = groundHeight + other.height
		var groundRigtht = groundWidth + other.width

		var shape = item.form

		if (shape === 'rectangle'){

			  bottom = centerY + item.height/2
			  ceiling = centerY - item.height/2
			  leftBorder = centerX - item.width/2
			  rightBorder = centerX + item.width/2

			if (state === 'upright'){
				if (bottom >= groundHeight) {
					posY = posY + displace.up
					console.log('up: ' + displace.up)
					item.setPos(posX, posY,true)
				}

				if (ceiling <= groundBottom) {
					posY = posY + displace.down
					item.setPos(posX, posY, true)
				}
			}

			if (state === 'horizontal') {
				if (leftBorder <= groundRigtht) {
					posX = posX + displace.right
					item.setPos(posX, posY, true)

				}

				if (rightBorder >= groundWidth) {
					posX = posX + displace.left
					item.setPos(posX, posY, true)
				}
			}

			if (state === 'both') {
				if (rightBorder >= groundWidth) {
					posX = posX + displace.left
					item.setPos(posX, posY, true)
				}

				if (leftBorder <= groundRigtht) {
					posX = posX + displace.right
					item.setPos(posX, posY, true)
				}

				if (ceiling <= groundBottom) {
					posY = posY + displace.down
					item.setPos(posX, posY,true)
				}

				if (bottom >= groundHeight) {
					posY = posY + displace.up
					item.setPos(posX, posY, true)
				}
			}
		}

		if (shape === 'triangle'){
			if (state === 'upright'){
				if (bottom > groundHeight) {
					posY = posY + displace.down
					item.setPos(posX, posY,true)
				}
			}
		}


		if (shape === 'circle'){
			  bottom = centerY + item.radius
			  ceiling = centerY - item.radius
			  leftBorder = centerX - item.radius
			  rightBorder = centerX + item.radius

			if (state === 'upright'){
				if (bottom > groundHeight) {
					posY = posY + displace.down
					item.setPos(posX, posY,true)
				}

				if (ceiling < 0) {
					posY = posY + displace.up
					item.setPos(posX, posY, true)
				}
			}

			if (state === 'horizontal') {
				if (leftBorder < 0) {
					posX = posX + displace.left
					item.setPos(posX, posY, true)
				}

				if (rightBorder > groundWidth) {
					posX = posX + displace.right
					item.setPos(posX, posY, true)
				}
			}

			if (state === 'both') {
				if (leftBorder < 0) {
					posX = posX + displace.left
					item.setPos(posX, posY, true)
				}

				if (rightBorder > groundWidth) {
					posX = posX + displace.right
					item.setPos(posX, posY, true)
				}

				if (bottom > groundHeight) {
					posY = posY + displace.down
					item.setPos(posX, posY,true)
				}

				if (ceiling < 0) {
					posY = posY + displace.up
					item.setPos(posX, posY, true)
				}
			}
		}
}

exports.resolveCollidingWithObject = function (item, other, state) {

	var dense = item.dense;
	var mass = item.mass;
	var type = item.form;
	var x = item.vector.vx;
	var y = item.vector.vy;
	var ax = item.vector.ax;
	var ay = item.vector.ay;


	switch (type) { // calculate out displace next time
		case 'rectangle':
			if (state === 'both') {
				x = -x;
				y = -y;

				item.vector.setSpeed(x, y);

				exports.resolveObjectDisplacement('both', item, other);
			}

			if (state === 'horizontal') {
				x = -x;
				y = y;

				item.vector.setSpeed(x, y);

				exports.resolveObjectDisplacement('horizontal', item, other);


				// console.log(item.vector)
			}

			if (state === 'upright') {
				x = x;
				y = -y

				item.vector.setSpeed(x, y);

				exports.resolveObjectDisplacement('upright', item, other);

				// console.log(item.vector);
			}

		break;

		case 'triangle':

		break;

		case 'circle':
			if (state === 'both') {
				x = -x;
				y = -y;

				item.vector.setSpeed(x, y);

				exports.resolveObjectDisplacement('both', item, other);
			}

			if (state === 'horizontal') {
				x = -x;
				y = y;

				item.vector.setSpeed(x, y);

				exports.resolveObjectDisplacement('horizontal', item, other);


				// console.log(item.vector)
			}

			if (state === 'upright') {
				x = x;
				y = -y

				item.vector.setSpeed(x, y);

				exports.resolveObjectDisplacement('upright', item, other);
				
				// console.log(item.vector);
			}
		break;
	}
}