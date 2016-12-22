var os = require('os');
var NodeCEC = require('nodecec')


	console.log("hostname",os.hostname().toLowerCase());
	if(os.hostname().toLowerCase() === "minde"){
		return;
	}
	
	var player = require("./omxplayer.js");	
	var cec = new NodeCEC();

	//start cec connection
	cec.start();

	cec.on('ready', function(data) {
	   console.log("ready...");
	});

	cec.on('status', function(data) {
		if(data.to){
			console.log("[" + data.id + "] changed from " + data.from + " to " + data.to); 
		}
	});

	cec.on('key', function(data) {
	   console.log("key:",data.name, data);
//	   pause { code: '46', name: 'pause' }
//	   play { code: '44', name: 'play' }
//	   stop { code: '45', name: 'stop' }
//	   exit { code: 'd', name: 'exit' }
//	   select { code: '0', name: 'select' }
//	   forward { code: '4b', name: 'forward' }
//	   backward { code: '4c', name: 'backward' }
//	   F2 { code: 'red', name: 'F2' }
//	   F3 { code: 'green', name: 'F3' }
//	   F4 { code: 'yellow', name: 'F4' }
//	   F1 { code: 'blue', name: 'F1' }
//	   key: right { code: '4', name: 'right' }
//	   key: left { code: '3', name: 'left' }
//	   key: up { code: '1', name: 'up' }
//	   key: down { code: '2', name: 'down' }

	   
	   
	   if(data.name=="stop"){
		   player.exit();
	   }else if(data.name=="pause"){
		   player.pause();
	   }else if(data.name=="left"){
		   player.back30();
	   }else if(data.name=="right"){
		   player.fwd30();
	   }else if(data.name=="down"){
		   player.fwd600();
	   }else if(data.name=="up"){
		   player.back600();
	   }
	   
	});

	cec.on('close', function(code) {
	   process.exit(0);
	});

	cec.on('error', function(data) {
	   console.log('---------------- ERROR ------------------');
	   console.log(data);
	   console.log('-----------------------------------------');
	});

	var stdin = process.openStdin();
	stdin.on('data', function(chunk) { 
	   cec.send(chunk);
	});
	  
	




module.exports.init = function () {

//	getOndemandTrailer(function() {});

}
	
