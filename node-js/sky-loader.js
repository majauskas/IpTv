
//var jsonChannels = require('./grid_meglio_channels.json');
var request = require('sync-request');
var cheerio = require('cheerio');
var database = require('./database.js');
var http = require('http');
var utils = require('./utils.js');
var fs = require('fs');
var parsers = require("playlist-parser");
var moment = require('moment');
var CronJob = require('cron').CronJob;

getChanels = function (callback) {
	var res = request("GET",'http://guidatv.sky.it/app/guidatv/contenuti/data/grid/grid_meglio_channels.js');
	return JSON.parse(res.getBody());
}

getChanelDetail = function (id, date, callback) {
	var year = date.getFullYear();
	var month = date.getMonth()+1;
	var date = date.getDate();
	month = (month<10) ? "0"+month : month;
	date = (date<10) ? "0"+date : date;
	date = (year+"").replace("20","") + "_"+month+"_"+ date;
	var channelDetail = {plan:[]};
	var url;
	try {
		url = 'http://guidatv.sky.it/app/guidatv/contenuti/data/grid/'+date+'/ch_'+id+'.js';
		var res = request("GET",url);
		channelDetail = JSON.parse(res.getBody());
	} catch (e) {
		console.error(id,url,e)
	}
	
	return channelDetail;

}

getEventDescription = function (id, callback) {
	if(!id || id == -1) return;
	
	try {
		
		var url = "http://guidatv.sky.it/EpgBackend/event_description.do?eid="+id;
		var res = request("GET",url);
		var body = res.getBody();
		
		var event = {};
		if(body)
			event = JSON.parse(body);
		if(!event.img_small){
			event.img_small = null; 
		}
		
		
		if(event.thumbnail_url && event.thumbnail_url !== "#"){
			var url2 = "http://guidatv.sky.it/app/guidatv/images"+event.thumbnail_url;	
			try {
				event.img_small_url = url2;
				var res2 = request("GET",url2);
				var body2 = res2.getBody();
				var img_small = {};
				if(body2){
					var imgBase64 = new Buffer(body2, 'binary').toString('base64');
					event.img_small = imgBase64;
				}
			} catch (e) {}

//			var url3 = "http://guidatv.sky.it/app/guidatv/images"+event.thumbnail_url;	
//			url3 = url3.replace("-small-","-visore-").replace("small.","visore.").replace("sma.","big.")
//			.replace("1024","1280")
//			.replace("-Small.","-Large.")
//			;
//			try {
//				if(url3.indexOf("big.")>0){
//					event.img_big_url = url3;
//					var res3 = request("GET",url3);
//					var body3 = res3.getBody();
//					var img_big = {};
//					if(body3){
//						var imgBase64 = new Buffer(body3, 'binary').toString('base64');
//						event.img_big = imgBase64;
//					}
//				}
//			} catch (e) {
//				console.log(id,url2,url3);
//			}
			
			return event;
		}else{
			return event;
		}
	} catch (e) {
		return;
	}

}







	
	
getProgrammaDetail = function (callback) {
		var startDate = new Date();
		console.log("-- getProgrammaDetail Start --");
		database.PROGRAMS.find({description2:null,genre:"film"},{ id: 1,genre: 1,subgenre: 1,normalizedtitle: 1,pid: 1 }).exec(function (err, programs) {
				console.log(programs.length);
				  programs.forEach(function(program) {
					  var url = 'http://guidatv.sky.it/guidatv/programma/'+program.genre+'/'+program.subgenre+'/'+program.normalizedtitle+'_'+program.pid+'.shtml?eventid='+program.id;
					  url = url.replace(/ /g,"");
					  try {
							var res = request("GET",url);
							var body = res.getBody();
							if(body){
								
						        var parsedHTML = cheerio.load(body, {
						            normalizeWhitespace: true
						        });
						        
						        var img_big_url = parsedHTML('.foto img').attr('src');
						        if(!img_big_url){
						        	img_big_url = parsedHTML('meta[property="og:image"]').attr('content');
						        	if (img_big_url == "http://guidatv.sky.it/app/guidatv/images"){
						        		var locandina = parsedHTML('.locandina img').attr('src');
						        		if(locandina){
						        			img_big_url = "http://guidatv.sky.it"+locandina; 
						        		}else{
						        			img_big_url = null;
						        		}
							        	
							        }
						        } 
						        	
						        parsedHTML('div[class="content on"] div[class="testo"] i').html("");
						        var description2 = parsedHTML('div[class="content on"] div[class="testo"]').text();
						        
//						        parsedHTML('.info1 strong').html("");
//						        parsedHTML('.info1 br').html("#");
//						        var info1 = parsedHTML('.info1').text();
//						        info1 = info1.replace(/ : /g,"").replace(/ # /g,"").replace(/ /g,"");
//						        info1 = info1.split("#")
//						        var uscita = info1[0];
//						        var nazione = info1[1];
//						        var audio = info1[4];
//						        var age = info1[5];
//			
//						        parsedHTML('.info2 strong').html("");
//						        parsedHTML('.info2 br').html("#");
//						        var info2 = parsedHTML('.info2').text();
//						        info2 = info2.replace(/: /g,"");
//						        info2 = info2.split("#")
//						        var regia = (info2[0]+"").trim();
//						        var cast = (info2[1]+"").trim();
						        
						        var img_big = null;
						        if(img_big_url){
									try {
										var res3 = request("GET",img_big_url);
										var body3 = res3.getBody();
										if(body3){
											img_big = new Buffer(body3, 'binary').toString('base64');
										}
									} catch (e) {
										 console.log("Error img_big: ", program.id,url,img_big_url);
									}	
						        }else{
						        	img_big_url = null;
						        }
						        
//						        console.log("updating: ", program.id,{
//						        	img_big_url: img_big_url,
//									img_big: img_big,
//					    		    description2: description2
//					    		  } );
						        database.PROGRAMS.findOneAndUpdate({id: program.id}, {
						        	img_big_url: img_big_url,
									img_big: img_big,
					    		    description2: description2
//					    		    uscita: uscita,
//					    		    nazione: nazione,
//					    		    audio: audio,
//					    		    age: age,
//					    		    regia: regia,
//					    		    cast: cast
					    		  }, {upsert : false}, function (err, res) {
//					    			  console.log("OK:",err, res);
					    		  });	
//						        console.log("OK2: ", program.id,url);
								
							}
						} catch (e) {
							 console.log("error main:",program.id,url);
						}
				  });
				  var diff = moment(new Date()).diff(startDate, 'seconds');
				  console.log("-- getProgrammaDetail End --", diff);
				  callback();
		});	

	}
	
	
	
	function setChannels() {
		var startDate = new Date();
		console.log("-- setChannels Start --");
		var channels = getChanels();
		channels.forEach(function(channel) {
			var url = channel.logomsite;
			var res = request("GET",url);
			var body = res.getBody();
			var channellogo = {};
			var imgBase64 = new Buffer(body, 'binary').toString('base64');
		    database.CHANNELS.findOneAndUpdate({id : channel.id}, {name : channel.name, number : channel.number, service : channel.service, imgBase64 : imgBase64}, {upsert : true}, function (err, res) {});
		});
		var diff = moment(new Date()).diff(startDate, 'seconds');
		console.log("-- setChannels End --",diff);
	}

	function setPrograms(callback) {
		var startDate = new Date();
		console.log("-- setPrograms Start --");
		  database.CHANNELS.find({file:{$ne : null}}).exec(function (err, channels) {
			  channels.forEach(function(channel) {
				  var channelDetail = getChanelDetail(channel.id, new Date());
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
			  });
			  var diff = moment(new Date()).diff(startDate, 'seconds');
			  console.log("-- setPrograms End --",diff);
			  callback();
		  });
		  
	}

	function setEvents(callback) {
		var startDate = new Date();
		console.log("-- setEvents Start --");
		var s = new Date();
//		var c = 0;
		database.PROGRAMS.find({img_small:null,description:null},{ id: 1 }).exec(function (err, programs) {
			  console.log(programs.length);
			  programs.forEach(function(program) {
//				 console.log(c++);
				 var eventDescription = getEventDescription(program.id);
				 if(eventDescription){
					 database.PROGRAMS.findOneAndUpdate({id: program.id}, {
						img_small: eventDescription.img_small,
						img_small_url: eventDescription.img_small_url,
		    		    description: eventDescription.description
		    		  }, {upsert : true}, function (err, res) {});	
				 }
			  });
			  var diff = moment(new Date()).diff(startDate, 'seconds');
			  console.log("-- setEvents End --",diff);
			  callback();
		});	
		
	}


	function setChannelsUrl() {
		var startDate = new Date();
		console.log("-- setChannelsUrl Start --");
		var res = request("GET","http://lucky.lts1.net:23000/get.php?username=mindagaus&password=x6COWBCJmH&type=m3u&output=mpegts");
		var body = res.getBody();
		var b = new Buffer(body, 'binary');
		fs.writeFileSync("playlist.m3u", b);
        var M3U = parsers.M3U;
        var playlist = M3U.parse(fs.readFileSync("playlist.m3u", { encoding: "utf8" }));
        playlist.forEach(function(item) {
        	var title = item.title.replace("-1,","");
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
        	database.CHANNELS.findOneAndUpdate({name: title}, {file: item.file}, {upsert : false}, function (err, res) {});
			  
		  });
        var diff = moment(new Date()).diff(startDate, 'seconds');
        console.log("-- setChannelsLiveUrl End --",diff);
		
	}
	
	module.exports.init = function () {
		
		database.CHANNELS.findOne({file:{$ne : null}}).exec(function (err, channels) {
			if(channels){
				console.log('sync later');
				new CronJob("00 01 06 * * *", function(){
					console.log('job sync at ', new Date());
					startSync();
				},null, true, null, {});
			}else{
				console.log('sync now');
				setTimeout(startSync, 1000);
			}
			
		});
		
		
		
		
		
		
//	  setTimeout(startSync, 1000);
	  
	}
	
	
	function startSync() {
		
		  var startDate = new Date();
	      database.CHANNELS.remove({}, function (err, data) {});
	      database.PROGRAMS.remove({}, function (err, data) {});
//	      database.ONDEMAND.remove({}, function (err, data) {});
	      
	      setChannels();
	      setChannelsUrl();
	      setPrograms(function() {
	    	  setEvents(function() {
	    		  setEvents(function() {
		    		  getProgrammaDetail(function() {
				    	  
		    			  var diff = moment(new Date()).diff(startDate, 'seconds');
						  console.log("-- sync finished --", diff);
				      });
	    		  });
		      });
	      });
	}