
var child_process = require('child_process');
var exec = child_process.exec;
var spawn = child_process.spawn;

var omxProcess = null;

module.exports.init = function (source) {
	
//	if (Number.isInteger(initialVolume)) {
//		args.push('--vol', initialVolume);
//	}
	
//	var args = [source, '-live', '--win', '1200, 600, 1915, 1075'];
//	--fps 25.000000
	var args = [source];
	omxProcess = spawn('omxplayer', args);
	omxProcess.stdin.setEncoding('utf-8');
	omxProcess.on('close', function (data) {
		console.log('Close omxplayer', data);
	});

	omxProcess.on('error', function (err) {
		console.log('Problem running omxplayer, is it installed?.', err);
	});
	
//	omxProcess.on('data', function (data) {
//		console.log('omxplayer data', data);
//	});
//	
	
	
	omxProcess.on('load', function(files, options){console.log('omxplayer load', files, options);}); // video successfully loaded (omxprocess starts)
	omxProcess.on('play', function(data){console.log('omxplayer play', data);});  // when successfully started or resumed from pause
	omxProcess.on('pause', function(data){console.log('omxplayer pause', data);}); // when successfully paused
	omxProcess.on('stop', function(data){console.log('omxplayer stop', data);});  // when successfully stopped (omxplayer process ends)
	
}

module.exports.exit = function () { 
//	if(omxProcess) omxProcess.stdin.write('q');
	console.log("killing omxplayer");
	exec("kill -9 $(ps aux | grep 'omxplayer' | awk '{print $2}')");
	console.log("kill omxplayer ok");
}
module.exports.play = function () { omxProcess.stdin.write('p'); };
module.exports.pause = function ()  { omxProcess.stdin.write('p'); };
module.exports.volUp = function ()  { omxProcess.stdin.write('+'); };
module.exports.volDown = function ()  { omxProcess.stdin.write('-'); };
module.exports.fastFwd = function ()  { omxProcess.stdin.write('>'); };
module.exports.rewind = function ()  { omxProcess.stdin.write('<'); };
module.exports.fwd30 = function ()  { omxProcess.stdin.write('\u001b[C'); };
module.exports.back30 = function ()  { omxProcess.stdin.write('\u001b[D'); };
module.exports.fwd600 = function ()  { omxProcess.stdin.write('\u001b[A'); };
module.exports.back600 = function ()  { omxProcess.stdin.write('\u001b[B'); };
module.exports.quit = function ()  { omxProcess.stdin.write('q'); };
module.exports.subtitles = function ()  { omxProcess.stdin.write('s'); };
module.exports.info = function ()  { omxProcess.stdin.write('z'); };
module.exports.incSpeed = function ()  { omxProcess.stdin.write('1'); };
module.exports.decSpeed = function ()  { omxProcess.stdin.write('2'); };
module.exports.prevChapter = function ()  { omxProcess.stdin.write('i'); };
module.exports.nextChapter = function ()  { omxProcess.stdin.write('o'); };
module.exports.prevAudio = function ()  { omxProcess.stdin.write('j'); };
module.exports.nextAudio = function ()  { omxProcess.stdin.write('k'); };
module.exports.prevSubtitle = function ()  { omxProcess.stdin.write('n'); };
module.exports.nextSubtitle = function ()  { omxProcess.stdin.write('m'); };
module.exports.decSubDelay = function ()  { omxProcess.stdin.write('d'); };
module.exports.incSubDelay = function ()  { omxProcess.stdin.write('f'); };


module.exports.command = function (command) { omxProcess.stdin.write(command); }

