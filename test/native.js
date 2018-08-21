var log = console.log.bind(console);

var time = console.time.bind(console);

var timeEnd = console.timeEnd.bind(console);

var assert = require('assert');


describe('Array', function () {
	describe('#indexOf()', function () {
		it('should return -1 when the value is not present');
		it('let us get this done');
		assert.equal(-1, [1,2,3].indexOf(4));
	})
})


module.exports = {
	log: log,
	time: time,
	timeEnd: timeEnd
}

