var log = console.log.bind(console);

var time = console.time.bind(console);

var timeEnd = console.timeEnd.bind(console);
var assert = require('assert');
var tools = require('../tools.js');

// describe('asd', function () {
// 	describe('#indexOf()', function () {
// 		it('should return -1 when the value is not present');
// 		it('let us get this done');
// 		assert.equal(-1, [1,2,3].indexOf(4));
// 	})
// })

describe('the endowing ability of tool', function () {
	it ('should work finally ending up swapping attrs', function () {
		var a = {
			asd: 10,
			asd1: 9,
			asd2: null,
			p: {
				a: 1
			}
		}

		var attr = {
			asd: 1,
			asd1: 2,
			asd2: 10,
			p: {
				a: 2
			}
		}
		assert.deepEqual({asd:1, asd1: 2, asd2: 10, p: {a: 2}}, tools.endowAttrs(a, attr));
	});
});

describe('the extendDeep function of tool', function () {
	it ('should work and return proper target', function () {
		var target = {
			a: {
				
			},
		};

		var attrs = {
			a: {
				a: {
					s: 10
				},

				b: 100
			},
			c: 30
		};

		var result = {
			a: {
				a: {
					s: 10
				},

				b: 100,
			},

			c: 30,

		}

		assert.deepEqual(result, tools.extend(target, attrs, false, true))
	});

	it('should work in safe mode', function () {
		var target = {
			a: 1,
			b: 2
		}

		var attrs = {
			a: 10,
			b: 20,
			c: 30
		}

		var result = {
			a: 1,
			b: 2,
			c: 30
		}

		assert.deepEqual(result, tools.extend(target, attrs, true, false));
	});
});

describe('shallowCopy unit of tools', function () {
	it('should return proper result of true of shallowCopy', function () {
		var a = {
			a: 1,
			b: 3,
			c: null,
			d: 0
		}

		var result = {
			a:1,
			b:3,
			d:0
		}

		assert.deepEqual(result, tools.shallowCopy({}, a))
	})
})

module.exports = {
	log: log,
	time: time,
	timeEnd: timeEnd
}

