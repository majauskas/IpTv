
var spawn = require('child_process').spawn;

var omxProcess = null;

module.exports.init = function (source) {
	
//	if (Number.isInteger(initialVolume)) {
//		args.push('--vol', initialVolume);
//	}
	
	var args = [source, '-live', '--win', '1200, 600, 1915, 1075'];
	omxProcess = spawn('omxplayer', args);
	omxProcess.stdin.setEncoding('utf-8');
	omxProcess.on('close', function (data) {
		console.log('Close omxplayer', data);
	});

	omxProcess.on('error', function (err) {
		console.log('Problem running omxplayer, is it installed?.', err);
	});
	
}

module.exports.play = function () { omxProcess.stdin.write('p'); }
module.exports.pause = function () { omxProcess.stdin.write('p'); }
module.exports.exit = function () { omxProcess.stdin.write('q'); }
module.exports.volUp = function () { omxProcess.stdin.write('+'); }
module.exports.volDown = function () { omxProcess.stdin.write('-'); }
module.exports.command = function (command) { omxProcess.stdin.write(command); }

