
var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');
var os = require('os');
var player = require("./omxplayer.js");
var skyLoader = require("./sky-loader.js");
var NodeCEC = require('nodecec')
var database = require('./database.js');
var http = require('http');
var request = require('sync-request');
var parsers = require("playlist-parser");

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
  
    database.CHANNELS.remove({}, function (err, data) {});
    database.PROGRAMS.remove({}, function (err, data) {});
    setChannels();
    setChannelsLiveUrl();
    setPrograms();
    setEvents();
//    setChannelsOndemandUrl(); 

    
  });
  
//Web Socket Connection
  var io = require('socket.io')(server);
  io.sockets.on('connection', function (socket) {  
  
		socket.on('socket-on-enter', function (data) {
			console.log("------- socket-on-enter ----------------",data);
			 player.init(data);
		});
		
		
		socket.on('socket-mobile-play', function (file) {
			console.log("------- socket-mobile-play ----------------",file);
			player.init(file);	
		});
		
	  	
		  console.log("OK nodeCEC");
return;		  
		  var cec = new NodeCEC();

		//start cec connection
		cec.start();

		cec.on('ready', function(data) {
		   console.log("ready...");
		});

		cec.on('status', function(data) {
		  console.log("[" + data.id + "] changed from " + data.from + " to " + data.to); 
		});

		cec.on('key', function(data) {
		   console.log("minde",data.name);
		   if(data.name=="exit"){
			   player.exit();
		   }else{
			   io.sockets.emit("SOCKET-REMOTE-CONTROLL", {key:data.name});
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
  

  
app.get("/show/:channel", function (req, res) {
	  database.PROGRAMS.findOne({channel:req.params.channel}).exec(function (err, doc) {
	        var base64dataa = new Buffer(doc.channellogo.data, 'binary').toString('base64');
	        res.contentType('image/png')
	        res.send(doc.channellogo.data);
	  })
});


app.get("/program/:channel", function (req, res) {
	  database.PROGRAMS.findOne({channel:req.params.channel}).exec(function (err, doc) {
//	        res.contentType('image/png')
	        res.send(doc);
	  })
});
app.get("/set-programs", function (req, res) {
	  setPrograms();
	  res.send({});
}); 
  



app.get("/set-events", function (req, res) {
	 setEvents();
	 res.send({});
});


app.get("/get-channels", function (req, res) {
	database.CHANNELS.find().sort('name').exec(function (err, channels) {
		 res.send(channels); 
	});
});

app.get("/get-programs", function (req, res) {
	var startDate = new Date();
	startDate.setHours(startDate.getHours() - 1);
	var endDate = new Date();
	endDate.setHours(endDate.getHours() +1);
	database.PROGRAMS.find({startDate: {$gte:startDate, $lt:endDate}, file:{$ne : null}}).sort('starttime').exec(function (err, programs) {
//		programs.forEach(function(program) {
////			console.log(program.startDate);
////			var startDate = program.startDate;
////			startDate.setMinutes(startDate.getMinutes() - 1);
//		});
		res.send(programs); 
	});
});


};

};


function setChannels() {	
	var channels = skyLoader.getChanels();
	channels.forEach(function(channel) {
		var url = channel.logomsite;
		var res = request("GET",url);
		var body = res.getBody();
		var channellogo = {};
		var imgBase64 = new Buffer(body, 'binary').toString('base64');
	    database.CHANNELS.findOneAndUpdate({id : channel.id}, {name : channel.name, number : channel.number, service : channel.service, imgBase64 : imgBase64}, {upsert : true}, function (err, res) {});
	});
	console.log("-- setChannels End --");
}

function setPrograms() {
	
	  database.CHANNELS.find({file:{$ne : null}}).exec(function (err, channels) {
		  channels.forEach(function(channel) {
			  var channelDetail = skyLoader.getChanelDetail(channel.id, new Date());
			  channelDetail.plan.forEach(function(record) {
				  if(record.id == -1) return;
  	    		  var time = record.starttime.split(':');
  	    		  var startDate = new Date();
  	    		  startDate.setHours(time[0], time[1],0,0);

  					 database.PROGRAMS.findOneAndUpdate({channel: channel.id, id : record.id}, {
      	    			  name: channel.name,
      	    			  file: channel.file,
      	    			  number: channel.number,
      	    			  service: channel.service,
      	    			  channellogo: channel.imgBase64,
      	    			  pid : record.pid, 
      	    			  starttime : record.starttime,
      	    			  startDate : startDate, 
      	    			  dur : record.dur, 
      	    			  title : record.title,
      	    			  normalizedtitle : record.normalizedtitle,
      	    			  desc : record.desc,
      	    			  genre : record.genre,
      	    			  subgenre : record.subgenre,
      	    			  prima : record.prima
      	    		  }, {upsert : true}, function (err, res) {});	   	  	    		 
  	    	  });
//	  	     });
		  });
		  console.log("-- setPrograms End --");
	  });
	  
}

function setEvents() {
	database.PROGRAMS.find({img_small:null,description:null}).exec(function (err, programs) {
		console.log(programs.length);
		  programs.forEach(function(program) {
			 var eventDescription = skyLoader.getEventDescription(program.id);
			 if(eventDescription){
				 database.PROGRAMS.findOneAndUpdate({id: program.id}, {
					img_small: eventDescription.img_small,
	    		    description: eventDescription.description
	    		  }, {upsert : true}, function (err, res) {});	
			 }
		  });
		  console.log("-- setEvents End --");
	});	
	
}
//function setEvents() {
//	var eventDescription = skyLoader.getEventDescription(90178408);
//	 console.log(eventDescription);	
//}


function setChannelsLiveUrl() {
	var res = request("GET","http://lucky.lts1.net:23000/get.php?username=mindagaus&password=x6COWBCJmH&type=m3u&output=mpegts");
	var body = res.getBody();
	var b = new Buffer(body, 'binary');
	fs.writeFile("playlist.m3u", b, function(err) {
	    if(err) {
	        console.log(err);
	    } else {
	        console.log("The file was saved!");
	        var M3U = parsers.M3U;
	        var playlist = M3U.parse(fs.readFileSync("playlist.m3u", { encoding: "utf8" }));
	        console.log(playlist.length);
	        playlist.forEach(function(item) {
	        	var title = item.title.replace("-1,","");
//	        	title = title.replace("Man-ga","MAN-GA");
	        	title = title
	        			.replace("Man-ga","MAN-GA")
	        			.replace("Real Time","Real Time HD")
	        			.replace("Cielo","Cielo HD")
	        			.replace("Sky 3D","Sky 3D - Ch 150")
	        			.replace("Sky Sport 24 HD","Sky Sport24 HD")
	        			.replace("Sky Moto GP HD","Sky Sport MotoGP HD")
	        			.replace("Eurosport 1 HD","Eurosport HD")
	        			.replace("Sky Cinema 1 HD","Sky Cinema Uno HD")
	        			.replace("SKY Cinema Family HD","Sky Cinema Family HD")
	        			.replace("Prima Fila 1 LIVE","Primafila 1")
	        			.replace("Sky CInema Classic HD","Sky Cinema Classics HD")
	        			.replace("National Geographic HD","National Geo HD")
	        			.replace("Discovery HD","Discovery Channel HD")
	        			.replace("History HD","History Channel HD")
	        			.replace("Dea Kids","DeAKids")
	        			.replace("Sky TG 24 HD","Sky TG24 HD")
	        			.replace("Nikeleodeon","Nickelodeon")
	        			.replace("Sky Disney Channel","Disney Channel HD")
	        			.replace("Dea Kids","DeA Junior")
	        			.replace("Disney XD","Disney XD HD")
	        			.replace("[MUSICA] MTV Rocks","MTV Rocks")
	        			.replace("[MUSICA] MTV Hits","MTV Hits")
	        			.replace("[MUSICA] MTV Music","MTV Music")
	        			.replace("Crime Investigation HD","CI Crime+ Investigation HD");
//	        	console.log(title);
	        	database.CHANNELS.findOneAndUpdate({name: title}, {file: item.file}, {upsert : false}, function (err, res) {});
				  
			  });
	        console.log("-- setChannelsLiveUrl End --");
	        
	    }
	});
	
}

function setChannelsOndemandUrl() {
	var res = request("GET","http://lucky.lts2.net:24000/get.php?username=mindagaus&password=wbrutd7DAp&type=m3u_plus&output=ts");
	var body = res.getBody();
	var b = new Buffer(body, 'binary');
	fs.writeFile("playlist-ondemand.m3u", b, function(err) {
	    if(err) {
	        console.log(err);
	    } else {
	        console.log("The file was saved!");
	        var M3U = parsers.M3U;
	        var playlist = M3U.parse(fs.readFileSync("playlist-ondemand.m3u", { encoding: "utf8" }));
//	        console.log(playlist.length);
	        var group = "";
	        playlist.forEach(function(item) {
	        	 
	        	var title = item.title;
	        	title = title
	        				.replace("-1 ","")
	        				.replace("tvg-name=\" ","tvg-name=\"")
	        				.replace("tvg-id=\"\" ","\"")
	        				.replace(/\" /g,"\", \"")
	        				.replace(/tvg-/g,"")
//	        				.replace("tvg-","")
	        				.replace("group-","")
	        				.replace(/=\"/g,"\":\"");//replace all
//	        	console.log(title);
	        	var entries = title.split(',');
//	        	console.log(entries);
	        	var entry = ("{"+entries[0]+","+entries[1]+","+entries[2]+"}").replace(/=\":\"/g,"=\""); 
//	        	console.log(entry);
	        	try {
	        		entry = JSON.parse(entry); 
	        		if (entry.name.indexOf("==") == 0){
	        			group = entry.name;
	        			return;
	        		}
//	        		tvg-name="==
//	        		console.log({name: entry.name, logo: entry.logo, title: entry.title, file:item.file});
	        		database.ONDEMAND.findOneAndUpdate({name: entry.name}, {title: entry.title, file:item.file, logo: ""+entry.logo, group:group}, {upsert : true}, function (err, res) {
//	        			console.log(err, res);
	        			
	        		});
				} catch (e) {
					console.log(title,"\t\t", entry,"\t\t", item.title);
				}
			  });
	        console.log("-- setChannelsOndemandUrl End --");
	        
	    }
	});
	
}

module.exports = new Server();

var s = new Server();
s.start();
