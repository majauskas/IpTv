
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
//				var res2 = request("GET",url2);
//				var body2 = res2.getBody();
//				var img_small = {};
//				if(body2){
//					var imgBase64 = new Buffer(body2, 'binary').toString('base64');
//					event.img_small = imgBase64;
//				}
			} catch (e) {}

			
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
		database.PROGRAMS.find({genre:"film"},{ id: 1,genre: 1,subgenre: 1,normalizedtitle: 1,pid: 1 }).exec(function (err, programs) {
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
						        
//						        var img_big = null;
//						        if(img_big_url){
//									try {
//										var res3 = request("GET",img_big_url);
//										var body3 = res3.getBody();
//										if(body3){
//											img_big = new Buffer(body3, 'binary').toString('base64');
//										}
//									} catch (e) {
//										 console.log("Error img_big: ", program.id,url,img_big_url);
//									}	
//						        }else{
//						        	img_big_url = null;
//						        }
						        database.PROGRAMS.findOneAndUpdate({id: program.id}, {
						        	img_big_url: img_big_url,
//									img_big: img_big,
					    		    description2: description2
					    		  }, {upsert : false}, function (err, res) {
					    		  });	
								
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
//						img_small: eventDescription.img_small,
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
	
	
	
	
	
	
	
getProgrammaDetailFromFilmtv = function (callback) {
		var startDate = new Date();
		console.log("-- getProgrammaDetailFromFilmtv Start --");
		database.PROGRAMS.find({genre:"film"},{ id: 1,genre: 1,subgenre: 1,normalizedtitle: 1,title: 1 }).exec(function (err, programs) {
				  programs.forEach(function(program) {
					  var url = 'http://www.filmtv.it/cerca/?q='+program.title;
					  console.log(url);
					  try {
							var res = request("GET",url);
							var body = res.getBody();
							if(body){
						        var parsedHTML = cheerio.load(body, {normalizeWhitespace: true});
						        
						        var href = parsedHTML('.items-list article .pic').attr('href');
						        var img_small_url = parsedHTML('.items-list img').attr('src');
						        var description2 = null;
						        var img_big_url = null;
						        try {
									var html = cheerio.load(request("GET","http://www.filmtv.it"+href).getBody(), {normalizeWhitespace: true});
									description2 = html('.scheda-desc p').html();
									img_big_url = html('.cover img').attr('src');
									console.log(img_big_url);
								} catch (e) {
									console.error("Error on scheda html",e)
								}
						        var cast = [];
						        var regia = {};
						        try {
						        	var cast_url = "http://www.filmtv.it"+href+"cast/";
									var castHtml = cheerio.load(request("GET",cast_url).getBody(), {normalizeWhitespace: true});
									regia.name = castHtml('article[class="membro-cast regia"] img').attr('alt');
									regia.img = castHtml('article[class="membro-cast regia"] img').attr('src');
							        castHtml('section[class="cast"]').find('article[class="membro-cast"]').each(function(i,membro) {
							        	var img = castHtml(this).find("img");
							        	cast.push({name:img.attr('alt'),img:img.attr('src')});
							        });
								} catch (e) {
									console.error("Error on cast html",e)
								}
						        
								
								 database.PROGRAMS.findOneAndUpdate({id: program.id}, {
									    img_small_url: img_small_url,
										img_big_url: img_big_url,
						    		    description2: description2,
						    		    regia: regia,
						    		    cast: cast
						    		  }, {upsert : false}, function (err, res) {});

								
							}
						} catch (e) {
							 console.log("error main:",program.id,url);
						}
				  });
				  var diff = moment(new Date()).diff(startDate, 'seconds');
				  console.log("-- getProgrammaDetailFromFilmtv End --", diff);
				  callback();
		});	

}	
	
	
	
getFilmTrailer = function (callback) {
	var startDate = new Date();
	console.log("-- getFilmTrailer Start --");
	database.PROGRAMS.find({genre:"film"},{ id: 1,title: 1 }).exec(function (err, programs) {
		  programs.forEach(function(program) {
			  var url = 'https://www.youtube.com/results?search_query=trailer '+program.title;
			  try {
//				  https://youtu.be/BCFXZTVrCYE
		        var parsedHTML = cheerio.load(request("GET",url).getBody(), {normalizeWhitespace: true});
		        var trailer_url = "https://www.youtube.com"+parsedHTML('.yt-lockup-title a').attr('href');
		        console.log(program.id,url, trailer_url);
				 database.PROGRAMS.findOneAndUpdate({id: program.id}, {
					 	trailer_url: trailer_url
		    	 }, {upsert : false}, function (err, res) {});
				 
				} catch (e) {
					 console.log("error trailer:",program.id,url,e);
				}
		  });
		  var diff = moment(new Date()).diff(startDate, 'seconds');
		  console.log("-- getFilmTrailer End --", diff);
		  callback();
	});	

}	


getOndemandTrailer = function (callback) {
	var startDate = new Date();
	console.log("-- getOndemandTrailer Start --");
	database.ONDEMAND.find({title:"===== PRIMAFILA===="},{ name: 1}).exec(function (err, programs) {
		  programs.forEach(function(program) {
			  
			  var name = program.name;
			  
			  name = name.replace("PF1 ","").replace("PF2 ","").replace("PF3 ","").replace("PF4 ","").replace("PF5 ","").replace("PF6 ","")
			  .replace("PF7 ","").replace("PF8 ","").replace("PF9 ","").replace("PF10 ","").replace("PF11 ","").replace("PF12 ","").replace("PF13 ","")
			  .replace("PF14 ","").replace("PF15 ","").replace("PF16 ","").replace("PF17 ","").replace("PF18 ","").replace("PF19 ","")
			  .replace(/-/g,"");
			  console.log(name);
			  var url = 'https://www.youtube.com/results?search_query=trailer '+name;
			  try {
//				  https://youtu.be/BCFXZTVrCYE
		        var parsedHTML = cheerio.load(request("GET",url).getBody('utf8'), {normalizeWhitespace: true});
		        var trailer_url = "https://www.youtube.com"+parsedHTML('.yt-lockup-title a').attr('href');
		        console.log(program.id,url, trailer_url);
				 database.ONDEMAND.findOneAndUpdate({name: program.name}, {
					 	trailer_url: trailer_url
		    	 }, {upsert : false}, function (err, res) {});
				 
				} catch (e) {
					 console.log("error trailer:",program.name,url,e);
				}
		  });
		  var diff = moment(new Date()).diff(startDate, 'seconds');
		  console.log("-- getOndemandTrailer End --", diff);
		  callback();
	});	

}


getOndemandDescription = function (callback) {
	var startDate = new Date();
	console.log("-- getOndemandDescription Start --");
	database.ONDEMAND.find({title:"===== PRIMAFILA===="},{ name: 1}).exec(function (err, programs) {
		  programs.forEach(function(program) {
			  
			  var name = program.name;
			  name = name.replace("PF1 ","").replace("PF2 ","").replace("PF3 ","").replace("PF4 ","").replace("PF5 ","").replace("PF6 ","")
			  .replace("PF7 ","").replace("PF8 ","").replace("PF9 ","").replace("PF10 ","").replace("PF11 ","").replace("PF12 ","").replace("PF13 ","")
			  .replace("PF14 ","").replace("PF15 ","").replace("PF16 ","").replace("PF17 ","").replace("PF18 ","").replace("PF19 ","")
			  .replace(/-/g,"");
			  console.log(name);
			  
			  var url = 'http://www.filmtv.it/cerca/?q='+name;
			  console.log(url);
			  try {
				        var parsedHTML = cheerio.load(request("GET",url).getBody(), {normalizeWhitespace: true});
				        
				        var href = parsedHTML('.items-list article .pic').attr('href');
				        var img_small_url = parsedHTML('.items-list img').attr('src');
				        var description2 = null;
				        var img_big_url = null;
				        try {
							var html = cheerio.load(request("GET","http://www.filmtv.it"+href).getBody(), {normalizeWhitespace: true});
							description2 = html('.scheda-desc p').html();
							img_big_url = html('.cover img').attr('src');
							console.log(img_big_url);
						} catch (e) {
							console.error("Error on scheda html",e)
						}
				        var cast = [];
				        var regia = {};
				        try {
				        	var cast_url = "http://www.filmtv.it"+href+"cast/";
							var castHtml = cheerio.load(request("GET",cast_url).getBody(), {normalizeWhitespace: true});
							regia.name = castHtml('article[class="membro-cast regia"] img').attr('alt');
							regia.img = castHtml('article[class="membro-cast regia"] img').attr('src');
					        castHtml('section[class="cast"]').find('article[class="membro-cast"]').each(function(i,membro) {
					        	var img = castHtml(this).find("img");
					        	cast.push({name:img.attr('alt'),img:img.attr('src')});
					        });
						} catch (e) {
							console.error("Error on cast html",e)
						}
						database.ONDEMAND.findOneAndUpdate({name: program.name}, {
							img_small_url: img_small_url,
							img_big_url: img_big_url,
			    		    description: description,
			    		    regia: regia,
			    		    cast: cast
						}, {upsert : false}, function (err, res) {});

						
				} catch (e) {
					 console.log("error getOndemandDescription:",program.id,url);
				}
			  
			  
//			  var url = 'https://www.youtube.com/results?search_query=trailer '+name;
//			  try {
////				  https://youtu.be/BCFXZTVrCYE
//		        var parsedHTML = cheerio.load(request("GET",url).getBody('utf8'), {normalizeWhitespace: true});
//		        var trailer_url = "https://www.youtube.com"+parsedHTML('.yt-lockup-title a').attr('href');
//		        console.log(program.id,url, trailer_url);
//				 database.ONDEMAND.findOneAndUpdate({name: program.name}, {
//					 	trailer_url: trailer_url
//		    	 }, {upsert : false}, function (err, res) {});
//				 
//				} catch (e) {
//					 console.log("error trailer:",program.name,url,e);
//				}
		  });
		  var diff = moment(new Date()).diff(startDate, 'seconds');
		  console.log("-- getOndemandDescription End --", diff);
		  callback();
	});	

}







getProgrammaSky = function (callback) {
	var startDate = new Date();
	console.log("-- getProgrammaSky Start --");
	
	  var url = 'http://www.filmtv.it/programmi-tv/film-serie-tv/oggi/mattina/sky/';
	  try {
		  	var html = cheerio.load(request("GET",url).getBody('utf8'), {normalizeWhitespace: true});
		  	html('.item-scheda-film').each(function(i,membro) {
		  		var obj = html(this);
		  		
		  		var href = obj.find("header a").attr('href');
		  		var title = obj.find("header h1").text();
		  		
//		  		console.log(obj.html());
		  		console.log(href, title);
//	        	
//	        	cast.push({name:img.attr('alt'),img:img.attr('src')});
	        });
		  	
//	        var href = parsedHTML('.items-list article .pic').attr('href');
//	        var img_small_url = parsedHTML('.items-list img').attr('src');
//	
//	        
//	        var description2 = null;
//	        var img_big_url = null;
//	        try {
//				var html = cheerio.load(request("GET","http://www.filmtv.it"+href).getBody(), {normalizeWhitespace: true});
//				description2 = html('.scheda-desc p').html();
//				img_big_url = html('.cover img').attr('src');
//				console.log(img_big_url);
//			} catch (e) {
//				console.error("Error on scheda html",e)
//			}
//	        
//	        
//	        
//	        
//	        var cast = [];
//	        var regia = {};
//	        try {
//	        	var cast_url = "http://www.filmtv.it"+href+"cast/";
//				var castHtml = cheerio.load(request("GET",cast_url).getBody(), {normalizeWhitespace: true});
//				regia.name = castHtml('article[class="membro-cast regia"] img').attr('alt');
//				regia.img = castHtml('article[class="membro-cast regia"] img').attr('src');
//		        castHtml('section[class="cast"]').find('article[class="membro-cast"]').each(function(i,membro) {
//		        	var img = castHtml(this).find("img");
//		        	cast.push({name:img.attr('alt'),img:img.attr('src')});
//		        });
//			} catch (e) {
//				console.error("Error on cast html",e)
//			}
//	        
//			
//			 database.PROGRAMS.findOneAndUpdate({id: program.id}, {
//				    img_small_url: img_small_url,
//					img_big_url: img_big_url,
//	    		    description2: description2,
//	    		    regia: regia,
//	    		    cast: cast
//	    		  }, {upsert : false}, function (err, res) {});
//	
			
		} catch (e) {
			 console.log("error get programma Sky:");
		}
	  var diff = moment(new Date()).diff(startDate, 'seconds');
	  console.log("-- getProgrammaSky End --", diff);
	  callback();

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
		
		
		
		
//		getProgrammaDetailFromFilmtv(function() {});
//		getProgrammaSky(function() {});
//		getFilmTrailer(function() {});
		
//	  setTimeout(startSync, 1000);
		
//		getOndemandTrailer(function() {});
//		getOndemandDescription(function() {});
		
	  
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
		    			  getProgrammaDetailFromFilmtv(function() {
		    				  getFilmTrailer(function() {
				    			  var diff = moment(new Date()).diff(startDate, 'seconds');
								  console.log("-- sync finished --", diff);
						      }); 
					      }); 
		    			 
				      });
	    		  });
		      });
	      });
	}