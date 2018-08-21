var quadTree = require('../quadTree.js')
var tools = require('../tools.js')
var assert = require('assert');

tools.log(quadTree)
var tree = new quadTree({
	x: 0,
	y: 0,
	width: 100,
	height: 100
})
/*[ 'bounds',
  'nodes',
  'clear',
  'getAllObjects',
  'findObjects',
  'insert',
  'getIndex',
  'split' ]
*/
describe('bounds', function () {
	it('bounds should exist', function () {
		var a = new quadTree()
		var bounds = {
			 x: 0,
	         y: 0,
	         width: 0,
	         height: 0
		}

		assert.deepEqual(bounds, a.bounds)
	})
})

describe('clear', function () {
	it('should return null nodes', function () {
		var a = new quadTree()
		var b = new quadTree()
		b.split()
		b.clear()
		assert.deepEqual(a.nodes, b.nodes)
	})
})

describe('split', function () {
	it ('should result right', function () {
		var a = new quadTree()
		var b = new quadTree()
		b.split()
		a.split()
		assert.deepEqual(a.nodes[0].nodes, b.nodes[0].nodes)
	})
})



describe('getAllObjects', function () {
	it ('should result right', function () {
		var a = new quadTree({
	        x: 0,
	        y: 0,
	        width: 500,
	        height: 500
    	})

		for (var i = 0; i < 15; i ++) {
			a.insert({
				x: 20 + i,
				height: 20 + i,
				width: 50,
				height: 50
			})
		}

		var result = []

		a.getAllObjects(result)

		assert.equal(result.length, 15)
	})
})


describe('getIndex', function () {
	it('detect index finder at 3(4)', function () {
		var a = new quadTree({
	        x: 0,
	        y: 0,
	        width: 100,
	        height: 100
    	})

		for (var i = 0; i < 30; i ++) {
			a.insert({
				x: 30 + i,
				y: 30 + i,
				width: 1,
				height: 1
			})
		}

		var index = a.getIndex({
			x: 51,
			y: 51,
			width: 20,
			height: 20
		})

		assert.equal(index, 3)
	})
})


describe('findObjects', function () {
	it('detect index finder at 1', function () {
		var a = new quadTree({
	        x: 0,
	        y: 0,
	        width: 100,
	        height: 100
    	})

		for (var i = 0; i < 30; i ++) {
			a.insert({
				x: 30 + i,
				y: 30,
				width: 0.001,
				height: 0.001
			})
		}

		var result = []

		a.findObjects(result, {
			x: 53,
			y: 30,
			width: 1,
			height: 1
		})

		assert.equal(result.length, 10)
	})
})