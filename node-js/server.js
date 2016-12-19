
var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');
var os = require('os');
var exec = require('child_process').exec;
var player = require("./omxplayer.js");
var skyLoader = require("./sky-loader.js");
var onDemandLoader = require("./ondemand-loader.js");
var hdmiCEC = require("./hdmi-cec.js");
var database = require('./database.js');
var http = require('http');
var request = require('sync-request');
var parsers = require("playlist-parser");
var utils = require('./utils.js');
var moment = require('moment');


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
  
    onDemandLoader.init();
    skyLoader.init();

    

    
  });
  
//Web Socket Connection
  var io = require('socket.io')(server);
  io.sockets.on('connection', function (socket) {  

	  	socket.on('socket-mobile-play', function (file) {
			player.exit();
			console.log("------- socket-mobile-play ----------------",file);
			player.init(file);
		});
		socket.on('socket-mobile-pause', function () {
			console.log("------- socket-mobile-pause ----------------");
			player.pause();	
		});
		socket.on('socket-mobile-stop', function () {
			console.log("------- socket-mobile-stop ----------------");
			player.exit();	
		});
		socket.on('socket-youtube-play', function (file) {
			player.exit();
			console.log("------- socket-youtube-play ----------------",file);
			player.youtubePlay(file);
		});
	  
  });


  

  
  


app.get("/set-programs", function (req, res) {
	  setPrograms();
	  res.send({});
}); 
  



app.get("/set-events", function (req, res) {
	 setEvents();
	 res.send({});
});


app.get("/get-channels-groups", function (req, res) {
	database.LUCKY_LIVE.aggregate(
//				{$match : {title : {$ne:""}}},
				{$group : {_id : "$group", total : { $sum : 1 }}},
				{$sort : {total : 1}}
			).exec(function (err, channels) {
		res.send(channels); 
	});
});

app.get("/get-channels/:group", function (req, res) {
	var group = req.params.group;
	database.LUCKY_LIVE.find({group:group,file:{$ne:null}}).sort('name').exec(function (err, channels) {
		 res.send(channels); 
	});
});

app.get("/get-programs/:genere", function (req, res) {
	var genere = req.params.genere;
	var startDate = new Date();
	startDate.setHours(startDate.getHours() - 1);
	var endDate = new Date();
	endDate.setHours(endDate.getHours() +5);
	database.PROGRAMS.find({ genre:genere, startDate: {$gte:startDate, $lt:endDate}, file:{$ne : null}}).sort('starttime').exec(function (err, programs) {
		res.send(programs); 
	});
});


app.get("/get-genere", function (req, res) {
	var startDate = new Date();
	startDate.setHours(startDate.getHours() - 1);
	var endDate = new Date();
	endDate.setHours(endDate.getHours() +5);	
	database.PROGRAMS.aggregate(
				{$match : {startDate : {$gte:startDate, $lt:endDate}}},
				{$group : {_id : "$genre", total : { $sum : 1 }}},
				{$sort : {total : 1}}
			).exec(function (err, programs) {
		res.send(programs); 
	});
});

app.get("/get-ondemand-groups", function (req, res) {
	database.ONDEMAND.aggregate(
				{$match : {title : {$ne:""}}},
				{$group : {_id : "$title", total : { $sum : 1 }}},
				{$sort : {total : 1}}
			).exec(function (err, programs) {
		res.send(programs); 
	});
});


app.get("/get-ondemand-programs/:genere", function (req, res) {
	var genere = req.params.genere;
	database.ONDEMAND.find({ title:genere, file:{$ne : null}}).sort('name').exec(function (err, programs) {
		res.send(programs); 
	});
});





};

};



module.exports = new Server();

var s = new Server();
s.start();
