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