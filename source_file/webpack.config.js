var webpack = require('webpack');
var path = require('path');
module.exports = {
	entry: {
		'pys': './accelerate.js'
	},
	output: {
		path: path.resolve(__dirname, 'src'),
		filename: 'pys.js'
	}
}