var log = console.log.bind(console);

var time = console.time.bind(console);

var timeEnd = console.timeEnd.bind(console);

module.exports = {
	log: log,
	time: time,
	timeEnd: timeEnd
}
