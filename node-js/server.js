
var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');
var os = require('os');
var player = require("./omxplayer.js");

var Server = function() {

this.start = function() {

	console.log("Starting server op port 8080 ... ");

  var host = null;
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, '/../webapp')));
  app.enable('view cache');
  var server = app.listen(process.env.PORT || 8080, function () {
  	var interfaces = os.networkInterfaces();
  	for (var k in interfaces) {
  		if(interfaces.hasOwnProperty(k)) {
  		    for (var k2 in interfaces[k]) {
  		    	if(interfaces[k].hasOwnProperty(k2)) {
  			        var address = interfaces[k][k2];
  			        if (address.family === 'IPv4' && !address.internal) {
  			        	host = address.address;
  			        }
  		    	}
  		    }
  		}
  	}
  
    var port = server.address().port;
    console.log('app listening at http://%s:%s', host, port);
  
    
  });
  
//Web Socket Connection
  var io = require('socket.io')(server);
  io.sockets.on('connection', function (socket) {  
  
		socket.on('socket-on-enter', function (data) {
			console.log("------- socket-on-enter ----------------",data);
//			callback({});		
		});
	  
		  setTimeout(function() {
			  console.log("------- socket-remote-controll  ----------------");
			  
			  io.sockets.emit("SOCKET-REMOTE-CONTROLL", {key:"aaaaaaaaaaaa"});
		  }, 5000);
		
		
	  
  });

  
  app.get('/play', function(req, res) {
	  player.init('http://lucky.lts1.net:23000/live/mindagaus/x6COWBCJmH/3806.ts');
	  res.send({});
  });
  
  app.get('/player/:command', function(req, res) {
	  player.command(req.params.command);
	  res.send({});
  });  

  app.get('/exit', function(req, res) {
	  player.exit();
	  res.send({});
  });  
  

};

};

module.exports = new Server();


