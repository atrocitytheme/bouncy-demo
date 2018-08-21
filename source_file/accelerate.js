/*
@module {vector.js}
@module {tools.js}
@module {resolver.js}
*/
var tools = require('./tools.js')
var Position = require('./position.js').Position
var test = require('./log.js')
var vector = require('./vector.js')
var engine = require('./engine.js')
var config = require('./config.js')
var Grid = require('./quadTree.js')

var log = test.log;
var endowAttrs = tools.endowAttrs;

var nativeKeys = Object.keys;
var hasNativeProperty = Object.hasOwnProperty;
var nativeSlice = Array.prototype.slice;
var define = Object.defineProperty;

var pid = 0;
var instanceNum = 1;
var objNum = 0

var defineSuper = function (child, parents) {

	if (!(parents instanceof Array)) throw new Error('parents must be contained in an Array')
	
		define(child, 'superClass', {
			enumerable: false,
			configurable: false,
			writable: true,
			value: parents
		});
}

var packGrid = function (shapeObj) {
	var result = {
		x: shapeObj.pos.getX(),
		y: shapeObj.pos.getY(),
		width: shapeObj.width,
		height: shapeObj.height,
		shapeObj: shapeObj
	}
	return result
}

var insertTree = function (shapeObj, tree) {
	var processed = packGrid(shapeObj)

	tree.insert(processed)
}
/*
@param {number}: g, wind, ground
@param (physics) {function}
	static: createPos, extend, instanceInherits, protoInherits, addBody, isPhysicsObj
	public: extend, isPhysicsObj, createPos

@param (shapes) {function}
	public: setPos
	_source
*/



function physics (defaultAttr) {
	var defaults = defaultAttr || config

	defaults.g = defaults.g

	this.defaults = defaults
	this.ground = null;
	this.props = [];
	this.g = defaults.g;
	this.id = 'pysInstance_' + instanceNum++;
	this.ax = defaults.ax
	this.grids = null
}

physics.fn = physics.prototype = {
	constructor: physics,

	extend: function () {

		var target = arguments[0],

		    restArgs = nativeSlice.call(arguments, 1),

		    idx = 0;

		    for (; idx < restArgs.length; idx++) {

		    	var obj = restArgs[idx];

		    	if (typeof obj !== 'object' && typeof obj !== 'function') continue;

		    	for (var name in obj) {
		    		// log(name)
		    		if (name !== 'defaults' && target[name] == null) {
		    			target[name] = obj[name];
		    		}
		    	}
		    }

		    return target
	},

	addGround: function (width = 450, height = 450, id = physics.pid(), posX = 100, posY = 100) {

		width = width < 200 ? 200 : width;
		height = height < 200 ? 200: height;

		this.ground = new square(width, height);
		this.ground.setType('static');
		this.ground.setSize(width, height);
		this.ground.setPos(posX, posY, true);
		this.ground.entity.id = id;
		this.ground.__world = true;
		this.ground.render();
		this.grids = new Grid({
			x: 0,
			y: 0,
			width: this.ground.width,
			height: this.ground.height
		})
		return this.ground
	},

	clear: function () {
		this.ground.clear();
		this.ground = null;
	},
	// @param {String} form the shape of the prop
	// @param {Obejct} options for the shape such as width or height
	addProps: function (form, options) {

		if (!this.grids) {
			throw Error('you should use addGround first!')
		}

		var options = options || {};

		var tree = this.grids


			options = tools.shallowCopy({}, options);

			var width = options.width || null,
				height = options.height || null,
				radius = options.radius || null,
				pos = options.pos || null,
				mass = options.mass || null,
				dense = options.dense || null,
				type = options.type || null,
				ay = options.ax || this.g,
				ax = options.ax || this.ax,
				vx = options.vx || 0,
				vy = options.vy || 0;

		switch (form) {
			case 'circle':
				
				var cir = new circle(radius, pos, mass, dense, type);
				var vector = physics.vector(vx, vy, ax, ay);

				cir.setPys(this);
				cir.setVector(vector);
				cir.render();

				this.props.push(cir);
				return cir;
			
			break;

			case 'triangle':
				
				var tri = new triangle(width, height, pos, mass, dense, type);
				var vector = physics.vector(vx, vy, ax, ay);

				tri.setPys(this);
				tri.setVector(vector);
				tri.render();

				this.props.push(tri);
				return tri;
				
			break;

			case 'rectangle':
			
				var rect = new square(width, height, pos, mass, dense, type);
				var vector = physics.vector(vx, vy, ax, ay);
				rect.setPys(this);
				rect.setVector(vector);
				rect.render();

				this.props.push(rect);

				var wrapper = packGrid(rect)
				this.grids.insert(wrapper)
				return rect
			
			break;
		}
	},

	start: function (eng) {
		eng = eng ? eng : engine;

		engine.load(this);

		engine.run();
	},

	detectCollide: function (shape) {
		var x = shape.pos.getX(),
			y = shape.pos.getY(),
		    vx = shape.vector.vx,
		    vy = shape.vector.vy,
		    ax = shape.vector.ax,
		    ay = shape.vector.ay,
		    form = shape.form;

		switch (form) {
			case 'triangle':
				var width = shape.width;
				var height = shape.height;
				var rightJudger = x + width;
				var lowerJudger = y + height;
				var leftJudger = x
				var upperJudger = y
			break;

			case 'rectangle':
				var width = shape.width;
				var height = shape.height;
				var rightJudger = x + width;
				var lowerJudger = y + height;
				var leftJudger = x
				var upperJudger = y

				// rightJudger = rightJudger + vx;
				// lowerJudger = lowerJudger + vy;
				// leftJudger = leftJudger + vx;
				// rightJudger = rightJudger + vx;
				
				if (leftJudger < 0 && upperJudger < 0) {
					return 'both'
				}

				if (rightJudger > this.ground.width && lowerJudger > this.ground.height) {
					return 'both'
				}

				if (rightJudger > this.ground.width && upperJudger < 0) {
					return 'both'
				}

				if (leftJudger < 0 && lowerJudger > this.ground.height) {
					return 'both'
				}

				if (leftJudger < 0 || rightJudger > this.ground.width) {
					return 'horizontal'
				}

				if (lowerJudger > this.ground.width || upperJudger < 0) {
					return 'upright'
				}

			break;

			case 'circle':

				var radius = shape.radius
				var rightJudger = x + 2 * radius
				var lowerJudger = y + 2 * radius
				var leftJudger = x
				var upperJudger = y

				// rightJudger = rightJudger + vx;
				// lowerJudger = lowerJudger + vy;
				// leftJudger = leftJudger + vx;
				// rightJudger = rightJudger + vx;
				
				if (leftJudger < 0 && upperJudger < 0) {
					return 'both'
				}

				if (rightJudger > this.ground.width && lowerJudger > this.ground.height) {
					return 'both'
				}

				if (rightJudger > this.ground.width && upperJudger < 0) {
					return 'both'
				}

				if (leftJudger < 0 && lowerJudger > this.ground.height) {
					return 'both'
				}

				if (leftJudger < 0 || rightJudger > this.ground.width) {
					return 'horizontal'
				}

				if (lowerJudger > this.ground.width || upperJudger < 0) {
					return 'upright'
				}
			break;
		}

		return false
	},

	check: function () {
		var inform = JSON.stringify(this.defaults);

		log(inform);

		return inform
	},

	pause: function () {
		engine.stop();
	},

	on: function (event, callback) {
		return engine.on(event, callback)
	},

	emit: function (event) {
		return engine.emit.apply(this, arguments);
	},

	once: function (event, callback) {
		return engine.once(event, callback);
	},

	stop: function () {
		engine.unload();
	},

	events: function () {
		engine.showEvents();
	},

	setGravity: function (x, y) {
		if (typeof x !== 'number' || typeof y !== 'number') {
			throw new Error('setGravity arguments: two numbers required')
		}
		this.g = y;
		this.ax = x
	},

	checkProps: function () {
		var props = this.props;
		var length = props.length;

		var result = {
			propNums: length,
			props: props
		}

		result = JSON.stringify(result)

		log(result)

		return result
	},

	refresh: function () {
		var tree = this.grids

		tree.refresh()
	}
}

physics.fn.createPos = physics.createPos = function (x, y) {

	if (arguments.length !== 2) throw new Error('this pos must contain two params: x and y');

	var pos = Position(x, y);

	pos.constructor = physics;

	return pos

}

physics.instanceInherits = function (targetClass, args, context=null) {

	for (var i = 0; i < targetClass.superClass.length; i++) {
		var parent = targetClass.superClass[i];
		parent.apply(context, args);
	}

	return targetClass
} // 选择将子类的superclass的实例属性继承

physics.protoInherits = function (child, parents) {
	
	defineSuper(child, parents);
	tools.inherit(child);
} // 接受一个子类，和一个父类数组, 原型继承，实例属性并不继承，附加规定父类

physics.isPhysicsObj = physics.prototype.isPhysicsObj = function (obj, detect) {

															if (!obj || !obj.constructor || !(obj.constructor == physics || obj._source == physics)) {
																if (!detect) {
																	throw new Error('elements should be physics obj');
																} else {
																	return false
																}
															} else {
																return true
															}
														}

physics.pid = function () {
	return 'physics_' + (pid++)
}

physics.vector = physics.prototype.vector =function (vx, vy, ax, ay) {
	return new vector(vx, vy, ax, ay);
}

physics.extend = physics.fn.extend 

physics.test = 1;

// props for physics

// @method {displace} to calculate out the displace when colliding with an Object

function Shape (pos, mass, dense, type) {

	pos = pos || physics.createPos(0, 0);

	physics.isPhysicsObj(pos);

	this.mass = 10 || mass;
	this.dense = 10 || dense;
	this.type = type || 'dynamic';
	this._source = physics;
	this.pos = pos;
	this.vector = null;
	this.entity = document.createElement('div');
	this.__belong = null;
	this.id = 'pysObject_' + objNum++
	this.wrapper = null
}

Shape.prototype.wrap = function (shape) {
	this.wrapper = shape
}

Shape.prototype.setPos = function (x, y, noScreen) {

	if (arguments.length > 3 || arguments.length < 2) throw new Error('arguments form: Number, Number, [Boolean]');
	this.pos.setPos(x, y);

	if (noScreen) {
		return this.pos
	}

	// log('position is set');
	// log(this.pos);
	this.render();

	return this.pos
}

Shape.prototype.setType = function (type) {
	this.type = type || this.type;
	return this.type
}

Shape.prototype.setDense = function (dense) {
	this.dense = dense || this.dense;
	return this.dense
}

Shape.prototype.setWeight = function (mass) {
	this.mass = mass || this.mass;
	return this.mass;
}

Shape.prototype.clear = function () {
	if (this.__world) {
		document.body.removeChild(this.entity);
	} else {
		// log(this.__belong.props);
		this.__belong.props.shift();
		this.__belong.ground.entity.removeChild(this.entity);
	}
	return physics
}

Shape.prototype.stop = function (where) {
	if (this.__world) throw new Error ('world can not use stop');

	if (where === 'ax') {
		var ay = this.vector.ay
		var vy = this.vector.vy
		this.vector.setAccelerate(0, ay);
		this.vector.setSpeed(0, vy);
	}

	if (where === 'ay') {
		var ax = this.vector.ax;
		var vx = this.vector.vx;
		this.vector.setAccelerate(ax, 0);
		this.vector.setSpeed(vx, 0);
	}

	if (!where) {
		this.vector.setAccelerate(0, 0);
		this.vector.setSpeed(0, 0);
	}
}

Shape.prototype.setVector = function (vect) {
	this.vector = vect
}

Shape.prototype.setSpeed = function (x, y) {
	this.vector.setSpeed(x, y);
}

Shape.prototype.setAccelerate = function (x, y) {
	this.vector.setAccelerate(x, y);
}

Shape.prototype.render = function () {
	var self = this;

	var keys = nativeKeys(this),
		i = 0,
		shape = this.form,
		config;

		if (shape === 'rectangle') {
			config = {
				style: {
					width: self.width + 'px',
					height: self.height + 'px',
					position: 'absolute',
					left: self.pos.getX() + 'px',
					top: self.pos.getY() + 'px',
					border: '1px solid #000',
					overflow: 'hidden'
				}
			};
		}

		if (shape === 'triangle') {
			config = {
				style: {

				}
			}
		}

		if (shape === 'circle') {
			config = {
				style: {
					width: 2*(self.radius) + 'px',
					height: 2 *(self.radius) + 'px',
					position: 'absolute',
					left: self.pos.getX() + 'px',
					top: self.pos.getY() + 'px',
					border: '1px solid #000',
					overflow: 'show',
					borderRadius: self.radius + 'px'
				}
			}
		}

		var zone = this.__belong ? (this.__belong.ground.entity || document.body) : document.body;


		if (!this.__world) {
			// log(this.vector)
		}

		if (!this.onScreen) {
			endowAttrs(this.entity, config);
			zone.appendChild(this.entity);
			this.onScreen = true;
			return physics;
		}

		endowAttrs(this.entity, config);
}

Shape.prototype.setPys = function (pysEntity) {
	if (!pysEntity instanceof physics) throw new Error('pys entity required');
	log('pysSet')
	this.__belong = pysEntity;
}

// @isPhysics
function square (width, height) {

	this.width = width || 10;
	this.height = height || 10;
	this.form = 'rectangle';
	var args = nativeSlice.call(arguments, square.length);

	physics.instanceInherits(square, args, this);
}

physics.protoInherits(square, [Shape]); // @square

square.prototype.setSize = function (width, height) {
	this.width = width;
	this.height = height
}

square.prototype.detectCollideWithWorld = function () {

	var collideWithBorder = this.__belong.detectCollide(this);
	if (collideWithBorder) {
		return collideWithBorder
	}

	return false
}

square.prototype.displace = function (other) {
	var self = this;
	var vector = this.vector
	var pos = this.getCenter()
	var width = this.width
	var height = this.height
	var groundWidth = this.__belong.ground.width
	var groundHeight = this.__belong.ground.height


	var leftDistance, rightDistence, upperDistance, lowerDistance;

	var vx = vector.vx,
		vy = vector.vy,
		ax = vector.ax,
		ay = vector.ay;

	var posX = pos.x,
		posY = pos.y;

	if (!other) {

		leftDistance = width/2 - pos.x
		rightDistence = groundWidth - width/2 - pos.x
		upperDistance = height/2 - pos.y
		lowerDistance = groundHeight - height/2 - pos.y
	} else {

		var otherRight = other.x + other.width
		var otherBottom = other.y + other.height

		leftDistance = other.x - width/2 - pos.x
		rightDistence = width/2 + otherRight - pos.x
		upperDistance = other.y - pos.y - height/2
		lowerDistance = height/2 + otherBottom - pos.y
	}

	var result = {
		left: leftDistance,
		right: rightDistence,
		up: upperDistance,
		down: lowerDistance
	}

	// log(result)

	return result

}

square.prototype.getCenter = function () {
	return {
		x: this.pos.getX() + this.width/2,
		y: this.pos.getY() + this.height/2
	}
}

square.prototype.macroCollideDetect = function () {
	var detectedObj = packGrid(this)
	var result = []

	this.__belong.grids.findObjects(result, detectedObj)

	if (this.check_status == true) {
		log(result.length)
	}
	
	return result
}

square.prototype.check_status = function () {
	this.check_status = true
}

square.prototype.detectCollideState = function (shape) { // 该方法拥有重大问题，无法精确囊括碰撞可能
	var shapeX = shape.pos.getX()
	var shapeY = shape.pos.getY()

	var shape_width = shape.width
	var shape_height = shape.height

	var shape_left = shapeX
	var shape_right = shapeX + shape_width
	var shape_up = shapeY
	var shape_down = shapeY + shape_height

	var item_width = this.width
	var item_height = this.height
	var item_x = this.pos.getX()
	var item_y = this.pos.getY()

	var item_a1 = {x:item_x, y: item_y}
	var item_a2 = {x:item_x + item_width, y: item_y}
	var item_a3 = {x:item_x + item_width, y: item_y + item_height}
	var item_a4 = {x:item_x, y: item_y + item_height}

	var inA1 = (item_a1.x >= shape_left && item_a1.x <= shape_right) && (item_a1.y >= shape_up && item_a1.y <= shape_down)

	var inA2 = (item_a2.x >= shape_left && item_a2.x <= shape_right) && (item_a2.y >= shape_up && item_a2.y <= shape_down)

	var inA3 = (item_a3.x >= shape_left && item_a3.x <= shape_right) && (item_a3.y >= shape_up && item_a3.y <= shape_down)

	var inA4 = (item_a4.x >= shape_left && item_a4.x <= shape_right) && (item_a4.y >= shape_up && item_a4.y <= shape_down)

	if (inA1 && inA2 && !inA3 && !inA4) {
		return 'upright'
	}

	if (inA3 && inA4 && !inA1 && !inA2) {
		return 'upright'
	}

	if (inA1 && inA4 && !inA2 && !inA3) {
		return 'horizontal'
	}

	if (inA2 && inA3 && !inA1 && !inA4) {
		return 'horizontal'
	}

	if (inA1) {
		return 'both'
	}

	if (inA2) {
		return 'both'
	}

	if (inA3) {
		return 'both'
	}

	if (inA4) {
		return 'both'
	}

	return false
}

function triangle (width, height) {
	this.width = width || 10;
	this.height = height || 10;
	this.form = 'triangle'
	var args = nativeSlice.call(arguments, triangle.length);

	physics.instanceInherits(triangle, args, this);
}
// inherits force
physics.protoInherits(triangle, [Shape]); // @triangle


function circle (radius) {
	this.radius = radius || 10;
	this.form = 'circle';
	var args = nativeSlice.call(arguments, circle.length);

	physics.instanceInherits(circle, args, this);
}

physics.protoInherits(circle, [Shape]);

circle.prototype.setSize = function (radius) {
	this.radius = radius
}

circle.prototype.detectCollideWithWorld = function () {

	var collideWithBorder = this.__belong.detectCollide(this);
	if (collideWithBorder) {
		return collideWithBorder
	}

	return false
}

circle.prototype.displace = function () {
	var self = this;
	var vector = this.vector
	var pos = this.getCenter()
	var radius = this.radius
	var groundWidth = this.__belong.ground.width
	var groundHeight = this.__belong.ground.height

	var vx = vector.vx,
		vy = vector.vy,
		ax = vector.ax,
		ay = vector.ay;

	var posX = pos.x,
		posY = pos.y;

	var leftDistance = radius - pos.x
	var rightDistence = groundWidth - radius - pos.x
	var upperDistance = radius - pos.y
	var lowerDistance = groundHeight - radius - pos.y

	var result = {
		left: leftDistance,
		right: rightDistence,
		up: upperDistance,
		down: lowerDistance
	}

	// log(result)

	return result

}


circle.prototype.getCenter = function () {
	return {
		x: this.pos.getX() + this.radius,
		y: this.pos.getY() + this.radius
	}
}

// physics.protoInherits(square, [Shape]); // @square
// physics.protoInherits(triangle, [Shape]); // @triangle
// physics.protoInherits(circle, [Shape]); // @circle
module.exports = physics

if (typeof window != 'undefined') {
	window.physics = physics
}