/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

var nativeCreate = Object.create;
var keys = Object.keys || function (obj) {
	var result = [];
	for (var name in obj) {
		if (obj.hasOwnProperty(name)) {
			result.push(name);
		}
	}

	return result;
}
var tools = {

	inherit: function (targetClass) {

		var proto = {};
		var superClasses = targetClass.superClass

		if (superClasses.length > 1) {

			for (var i = 0; i < superClasses.length; i++) {
				var parent = superClasses[i];
				var parentProto = parent.prototype;

				for (var name in parentProto) {
					if (!proto[name]) proto[name] = parentProto[name];
				}
	 		}

	 		targetClass.prototype = proto

	 	} else {

	 		targetClass.prototype = nativeCreate(superClasses[0].prototype);

	 		targetClass.prototype.constructor = targetClass

	 	}

	 	return targetClass

	}, // 原型链的继承

	pow: function (num, pow) {
		var idx = pow || 2;
		return Math.pow(num, pow);
	},

	
	extend: function (target, attrs, safe, deep) {
		var idx = 0;
		var names = keys(attrs);
		var length = names.length
		for (; idx < length; idx++) {

			var key = names[idx];
			var value = attrs[key]
			if (!safe) {
					if (typeof value === 'object' && deep) {
						target[key] = {}
						tools.extend(target[key], value, false, true);
					} else {
						target[key] = value;
					} 
			} else {
				if (typeof value === 'object' && deep) {
					tools.extend(target[key], value, true, true);
				} else {
					target[key] = target[key] ? target[key] : value;
				}
			}
		}

		return target
	},

	endowAttrs: function (target, attrs) {
		for (var name in attrs) {
			var value = attrs[name]
			if (name in target) {
				if (typeof value === 'object' && typeof target[name] === 'object') {
					tools.endowAttrs(target[name], value);
				} else {
					if (typeof target[name] !== 'function') target[name] = value
				}
			}
		}

		return target
	},

	shallowCopy: function (to, from) {
		var names = keys(from),
			i = 0;

		for (; i < names.length; i++) {
			var name = names[i];
			var value = from[name];

			if (value != null) to[name] = value;
		}


		return to;
	},

	log: function (Class, testAttr) {
		var test = testAttr || void 0
		Class = new Class(test)
		var keys = Object.keys(Class)
		if (keys.length) {
			console.log(keys)
			return
		} else {
			keys = []
			for (i in Class) {
				keys.push(i)
			}
			console.log(keys)
		}
	}
}

module.exports = tools;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

/*
@module {vector.js}
@module {tools.js}
@module {resolver.js}
*/
var tools = __webpack_require__(0)
var Position = __webpack_require__(2).Position
var test = __webpack_require__(3)
var vector = __webpack_require__(4)
var engine = __webpack_require__(5)
var config = __webpack_require__(7)
var Grid = __webpack_require__(8)

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

/***/ }),
/* 2 */
/***/ (function(module, exports) {

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

/***/ }),
/* 3 */
/***/ (function(module, exports) {

var log = console.log.bind(console);

var time = console.time.bind(console);

var timeEnd = console.timeEnd.bind(console);

module.exports = {
	log: log,
	time: time,
	timeEnd: timeEnd
}


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var tools = __webpack_require__(0)
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

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

var resolver = __webpack_require__(6);
var tools = __webpack_require__(0);

var engine = (function () {
	var runningEngine = null;
	var counter = 0;
	/*
	events: {
		defaults: ['collideWithWorld', 'collideWithProps']
	}
*/
	var events = {defaults: {__test:1}};


	function loop() {

		if (engine.pause) {
			cancelAnimationFrame(runningEngine);
			runningEngine = null;

			return
		}

		var physicsInstance = engine.target;

		physicsInstance.props.forEach(function (item, index) {

			resolver.calculateNormal(item);
			engine.target.refresh()
			// engine.target.refresh()
			resolver.detectCollide(item, physicsInstance.ground);
			// engine.target.refresh()

			resolver.render(item);
		});
		
		runningEngine = requestAnimationFrame(loop)
	}

	var engine = function (attrs) {

		var attrs = attrs || {}

		if (!engine.target) {
			throw new Error("your physics engine doesn't have a target of pys instance")
		}

		var physicsInstance = engine.target;

		tools.endowAttrs(physicsInstance, attrs)
	}

	engine.load = function (pysInstance) {

		engine.target = pysInstance
		events[pysInstance.id] = {}
	}

	engine.run = function () {
		engine.pause = false;
		resolver.load(engine);
		loop();
	}

	engine.stop = function () {
		engine.pause = true
		// console.log(runningEngine)
	}

	engine.on = function (event, callback) {

		if (typeof callback !== 'function' || arguments.length !== 2) {
				throw new Error('two arguments: Eventname, method')
			}
			if (engine.target) {
				var eventCollection = [];
				var eventsPointer = null; // event pointing to event triggers
				var previousInstance = events[engine.target.id]

				if (!previousInstance) {
					eventsPointer = {}
					events[engine.target.id] = eventsPointer;
				} else {
					eventsPointer = previousInstance
				}

				if (!eventsPointer[event]) {
					eventCollection.push(callback);
					eventsPointer[event] = eventCollection
				} else {
					eventsPointer[event].push(callback);
				}
			} else {
				var eventCollection = [];

				var defaultEvents = events.defaults;

				var defaultType = defaultEvents[event];

				if (!defaultType) {
					eventCollection.push(callback);
					events.defaults[event] = eventCollection;
				} else {
					defaultType.push(callback);
				}
			}

			return engine.target;
	}

	engine.unload = function () {
		engine.stop();

		var target = engine.target;

		delete events[target.id];

		console.log(JSON.stringify(events));

		engine.target = null;
	}

	engine.once = function (event, callback) {
		if (typeof callback !== 'function' || arguments.length !== 2) {
				throw new Error('two arguments: Eventname, method')
			}

			if (engine.target) {
				var eventCollection = [];
				var eventsPointer = null; // event pointing to event triggers
				var previousInstance = events[engine.target.id]

				if (!previousInstance) {
					eventsPointer = {}
					events[engine.target.id] = eventsPointer;
				} else {
					eventsPointer = previousInstance
				}

				if (!eventsPointer[event]) {
					callback.__type = 'once';
					eventCollection.push(callback);
					eventsPointer[event] = eventCollection
				} else {
					callback.__type = 'once';
					eventsPointer[event].push(callback);
				}
			} else {
				var eventCollection = [];

				var defaultEvents = events.defaults;

				var defaultType = defaultEvents[event];

				if (!defaultType) {
					callback.__type = 'once';
					eventCollection.push(callback);
					defaultType = eventCollection
				} else {
					callback.__type = 'once';
					defaultType.push(callback);
				}
			}

			return engine.target;
	}

	engine.emit = function (event) {
		var args = Array.prototype.slice.call(arguments, 1);
		var instanceName = engine.target.id;
		var eventCategory = events[instanceName] || {};
		var type = eventCategory[event];
		var defaultEvents = events.defaults;
		var defaultType = defaultEvents[event];

		if (!type && !defaultType) throw new Error("you haven't registerd this event before");

		try {

			if (defaultType && defaultType.length) {
				// console.log('!!!!!!!!!!!!!')
				// console.log(defaultType)

				for (var v = 0; v < defaultType.length; v++) {
					var func = defaultType[v];
					try {
						func.apply(this, args);
					} catch (e) {
						func.apply(null, e);
					}

					if (func.__type === 'once') {
						defaultType.splice(i, 1);
					}
				}
			}

			if (type && type.length) {
				for (var i = 0; i < type.length; i++) {
					var func = type[i];

					try {
						func.apply(engine.target, args);
					} catch (e) {
						func.apply(null, e);
					}

					if (func.__type === 'once') {
						type.splice(i, 1);
					}
				}
			}
		} catch (e) {
			
			throw e
		}
	}

	engine.showEvents = function () {
		console.log(JSON.stringify(events.defaults))
	}

	engine.pause = false;

	engine.on('collideWithWorld', function (prop, engine, resolver, state) {
		
		resolver.resolveCollidingWithWorld(prop, state);
		// engine.target.refresh()
	});


	engine.on('collideWithObject', function (prop, other, engine, resolver, state) {
		resolver.resolveCollidingWithObject(prop, other, state)
		// engine.target.refresh()
	})
	// console.log(events);

	return engine
})()
module.exports = engine

/***/ }),
/* 6 */
/***/ (function(module, exports) {


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
		
		if (item.check_status == true && state != false) {
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

/***/ }),
/* 7 */
/***/ (function(module, exports) {

var config = {
	g: 1
}

module.exports = config;

/***/ }),
/* 8 */
/***/ (function(module, exports) {

function isInner (rect, bounds) {
    return rect.x >= bounds.x &&
           rect.x + rect.width <= bounds.x + bounds.width &&
           rect.y >= bounds.y &&
           rect.y + rect.height <= bounds.y + bounds.height
}

function QuadTree(boundBox, lvl) {
    var maxObjects = 10;
    this.bounds = boundBox || {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };
    var objects = [];
    this.nodes = [];
    var level = lvl || 0;
    var maxLevels = 5;

    /*
     * Clears the quadTree and all nodes of objects
     */
    this.clear = function() {
        objects = [];

        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].clear();
        }

        this.nodes = [];
    };

    /*
     * Get all objects in the quadTree
     */
    this.getAllObjects = function(returnedObjects) {
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].getAllObjects(returnedObjects);
        }

        for (var i = 0, len = objects.length; i < len; i++) {
            returnedObjects.push(objects[i]);
        }

        return returnedObjects;
    };

    /*
     * Return all objects that the object could collide with
     */
    this.findObjects = function(returnedObjects, obj) {
        if (typeof obj === "undefined") {
            console.log("UNDEFINED OBJECT");
            return;
        }
        
        var index = this.getIndex(obj);

        if (index != -1 && this.nodes.length) {
            this.nodes[index].findObjects(returnedObjects, obj);
        }

        for (var i = 0, len = objects.length; i < len; i++) {
            if (objects[i].shapeObj.id === obj.shapeObj.id) continue
            returnedObjects.push(objects[i]);
        }
 
        return returnedObjects;
    };

    /*
     * Insert the object into the quadTree. If the tree
     * excedes the capacity, it will split and add all
     * objects to their corresponding nodes.
     */
    this.insert = function(obj) {
        if (typeof obj === "undefined") {
            return;
        }

        if (obj instanceof Array) {
            for (var i = 0, len = obj.length; i < len; i++) {
                this.insert(obj[i]);
            }

            return;
        }

        if (this.nodes.length) {
            var index = this.getIndex(obj);
            // Only add the object to a subnode if it can fit completely
            // within one
            if (index != -1) {
                this.nodes[index].insert(obj);

                return;
            }
        }

        objects.push(obj);

        // Prevent infinite splitting
        if (objects.length > maxObjects && level < maxLevels) {
            if (this.nodes[0] == null) {
                this.split();
            }

            var i = 0;
            while (i < objects.length) {

                var index = this.getIndex(objects[i]);
                if (index != -1) {
                    this.nodes[index].insert((objects.splice(i,1))[0]);
                }
                else {
                    i++;
                }
            }
        }
    };

    /*
     * Determine which node the object belongs to. -1 means
     * object cannot completely fit within a node and is part
     * of the current node
     */
    this.getIndex = function(obj) {

        var index = -1;
        var verticalMidpoint = this.bounds.x + this.bounds.width / 2;
        var horizontalMidpoint = this.bounds.y + this.bounds.height / 2;

        // Object can fit completely within the top quadrant
        var topQuadrant = (obj.y < horizontalMidpoint && obj.y + obj.height < horizontalMidpoint);
        // Object can fit completely within the bottom quandrant
        var bottomQuadrant = (obj.y > horizontalMidpoint);

        // Object can fit completely within the left quadrants
        if (obj.x < verticalMidpoint &&
                obj.x + obj.width < verticalMidpoint) {
            if (topQuadrant) {
                index = 0; // 写1的怕是失了智
            }
            else if (bottomQuadrant) {
                index = 2;
            }
        }
        // Object can fix completely within the right quandrants
        else if (obj.x > verticalMidpoint) {
            if (topQuadrant) {
                index = 1;
            }
            else if (bottomQuadrant) {
                index = 3;
            }
        }

        return index;
    };

    /*
     * Splits the node into 4 subnodes
     */
    this.split = function() {
        // Bitwise or [html5rocks]
        var subWidth = (this.bounds.width / 2) | 0;
        var subHeight = (this.bounds.height / 2) | 0;

        this.nodes[0] = new QuadTree({
            x: this.bounds.x + subWidth,
            y: this.bounds.y,
            width: subWidth,
            height: subHeight
        }, level+1);
        this.nodes[1] = new QuadTree({
            x: this.bounds.x,
            y: this.bounds.y,
            width: subWidth,
            height: subHeight
        }, level+1);
        this.nodes[2] = new QuadTree({
            x: this.bounds.x,
            y: this.bounds.y + subHeight,
            width: subWidth,
            height: subHeight
        }, level+1);
        this.nodes[3] = new QuadTree({
            x: this.bounds.x + subWidth,
            y: this.bounds.y + subHeight,
            width: subWidth,
            height: subHeight
        }, level+1);
    };


    this.refresh = function (root) {
        var objs = objects,
            rect, index, i, len;

        root = root || this;

        for (i = objs.length - 1; i >= 0; i--) {
            rect = objs[i];
            index = this.getIndex(rect);

            // 如果矩形不属于该象限，则将该矩形重新插入
            if (!isInner(rect, this.bounds)) {
                if (this !== root) {
                    root.insert(objs.splice(i, 1)[0]);
                }

            // 如果矩形属于该象限 且 该象限具有子象限，则
            // 将该矩形安插到子象限中
            } else if (this.nodes.length) {
                this.nodes[index].insert(objs.splice(i, 1)[0]);
            }
        }

        // 递归刷新子象限
        for (i = 0, len = this.nodes.length; i < len; i++) {
            this.nodes[i].refresh(root);
        }
    }
}

module.exports = QuadTree

/***/ })
/******/ ]);