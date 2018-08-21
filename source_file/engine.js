var resolver = require('./physicsResolver.js');
var tools = require('./tools.js');

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