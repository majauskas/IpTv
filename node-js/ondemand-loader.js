
var request = require('sync-request');
var cheerio = require('cheerio');
var database = require('./database.js');
var http = require('http');
var utils = require('./utils.js');
var fs = require('fs');
var parsers = require("playlist-parser");
var moment = require('moment');
var CronJob = require('cron').CronJob;
var youtubedl = require('youtube-dl');
var iconv = require('iconv-lite');



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
	


getOndemandTrailer = function (callback) {
	var startDate = new Date();
	console.log("-- getOndemandTrailer Start --");
	database.ONDEMAND.find({title: { $in: [
	                                       "PRIMAFILA",
	                                       "PRIMAFILA VOD - ITA",
	                                       "FILM COMICI",
	                                       "ON-DEMAND-ITALY",
	                                       "VOD-FILM-ENG",
	                                       "AL CINEMA"
//	                                       ,"VOD PRIMAVISIONE - ITA"
//	                                       ,"VOD-FILM-ITA"
	                                       ] }},{ name: 1}).exec(function (err, programs) {
	      var length = programs.length;	                                    	   
		  programs.forEach(function(program) {
			  
			  var name = program.name;
			  name = name.replace("PF1 ","").replace("PF2 ","").replace("PF3 ","").replace("PF4 ","").replace("PF5 ","").replace("PF6 ","")
			  .replace("PF7 ","").replace("PF8 ","").replace("PF9 ","").replace("PF10 ","").replace("PF11 ","").replace("PF12 ","").replace("PF13 ","")
			  .replace("PF14 ","").replace("PF15 ","").replace("PF16 ","").replace("PF17 ","").replace("PF18 ","").replace("PF19 ","")
			  .replace(/-/g,"");
			  
			  var url = 'https://www.youtube.com/results?search_query=trailer '+name;
			  try {
		        var parsedHTML = cheerio.load(request("GET",url).getBody('utf8'), {normalizeWhitespace: true});
		        var trailer_url = "https://www.youtube.com"+parsedHTML('.yt-lockup-title a').attr('href');
		        youtubedl.getInfo(trailer_url, function(err, info) {
		        	console.log(err, info);
		        	  if (err == null){
					  database.ONDEMAND.findOneAndUpdate({name: program.name}, {
					 	trailer_url: info.url,
					 	thumbnail_url: info.thumbnail
					  }, {upsert : false}, function (err, res) {
						  length--;
						  if(length<1){
							  var diff = moment(new Date()).diff(startDate, 'seconds');
							  console.log("-- getOndemandTrailer End --", diff);
							  callback(); 
						  }
					  });
		        	}else{
		        		length--;
		        		if(length<1){
		        			var diff = moment(new Date()).diff(startDate, 'seconds');
							  console.log("-- getOndemandTrailer End --", diff);
							  callback(); 
		        		}
		        	}
		        	  
		        	});
				 
				} catch (e) {
					length--;
					 console.log("error getOndemandTrailer:",program.name,url,e);
					 if(length<1){
		        			var diff = moment(new Date()).diff(startDate, 'seconds');
							  console.log("-- getOndemandTrailer End --", diff);
							  callback(); 
		        		}
				}
		  });
		  
	});	

}


getOndemandDescription = function (callback) {
	var startDate = new Date();
	console.log("-- getOndemandDescription Start --");
	database.ONDEMAND.find({title: { $in: [
	                                       "PRIMAFILA",
	                                       "PRIMAFILA VOD - ITA",
	                                       "FILM COMICI",
	                                       "ON-DEMAND-ITALY",
	                                       "VOD-FILM-ENG",
	                                       "AL CINEMA"
//	                                       ,"VOD PRIMAVISIONE - ITA"
//	                                       ,"VOD-FILM-ITA"
	                                       ] }},{ name: 1}).exec(function (err, programs) {
		var length = programs.length;	  
		programs.forEach(function(program) {
			  
			  var name = program.name;
			  name = name.replace("PF1 ","").replace("PF2 ","").replace("PF3 ","").replace("PF4 ","").replace("PF5 ","").replace("PF6 ","")
			  .replace("PF7 ","").replace("PF8 ","").replace("PF9 ","").replace("PF10 ","").replace("PF11 ","").replace("PF12 ","").replace("PF13 ","")
			  .replace("PF14 ","").replace("PF15 ","").replace("PF16 ","").replace("PF17 ","").replace("PF18 ","").replace("PF19 ","")
			  .replace(/-/g,"");
			  
			  var url = 'http://www.filmtv.it/cerca/?q='+name;
			  try {
				        var parsedHTML = cheerio.load(request("GET",url).getBody(), {normalizeWhitespace: true});
				        
				        var href = parsedHTML('.items-list article .pic').attr('href');
				        var img_small_url = parsedHTML('.items-list img').attr('src');
				        var description = null;
				        var img_big_url = null;
				        if(href){
					        try {
								var html = cheerio.load(request("GET","http://www.filmtv.it"+href).getBody(), {normalizeWhitespace: true});
								description = html('.scheda-desc p').html();
								img_big_url = html('.cover img').attr('src');
							} catch (e) {
								console.error("Error on scheda html",e)
							}
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
						}, {upsert : false}, function (err, res) {
							length--;
			        		if(length<1){
			        			var diff = moment(new Date()).diff(startDate, 'seconds');
								  console.log("-- getOndemandDescription End --", diff);
								  callback(); 
			        		}							
							
						});

						
				} catch (e) {
					length--;
					 console.log("error getOndemandDescription:",program.id,url);
					 if(length<1){
		        			var diff = moment(new Date()).diff(startDate, 'seconds');
							  console.log("-- getOndemandDescription End --", diff);
							  callback(); 
		        		}
				}
		  });
	});	

}




function setLuckyChannelsLive(callBack) {
	var startDate = new Date();
	console.log("-- setLuckyChannelsLive Start --");
	try {
		
	
	var res = request("GET","http://lucky.lts1.net:23000/get.php?username=mindagaus&password=x6COWBCJmH&type=m3u_plus&output=ts");
	var body = res.getBody();
	var b = new Buffer(body, 'binary');
	fs.writeFileSync("playlist-live.m3u", b);
    var M3U = parsers.M3U;
    var playlist = M3U.parse(fs.readFileSync("playlist-live.m3u", { encoding: "utf8" }));
    var group = "";
    var length = playlist.length;
    playlist.forEach(function(item) {
    	var title = item.title;
    	title = title
    				.replace("-1 ","")
    				.replace("tvg-name=\" ","tvg-name=\"")
    				.replace("tvg-logo=\" ","tvg-logo=\"")
    				.replace("tvg-id=\"\" ","\"")
    				.replace(/\" /g,"\", \"")
    				.replace(/tvg-/g,"")
    				.replace("group-","")
    				.replace(/=\"/g,"\":\"");//replace all
    	var entries = title.split(',');
    	var entry = ("{"+entries[1]+","+entries[2]+","+entries[3]+"}").replace(/=\":\"/g,"=\""); 
    	try {
    		entry = JSON.parse(entry); 
    		if (entry.name.indexOf("---") == 0){
    			group = entry.name.replace("---- < ","").replace(" > ---","").replace(/---------/g,"").replace("---< ","").replace(" >----","");
    			length--;
    			return;
    		}
    		entry.group = group;   		
    		if(entry.logo){
    			entry.logo = entry.logo.replace("i65.","oi65.");
    		}
    		database.LUCKY_LIVE.findOneAndUpdate({name: entry.name}, {title: entry.title, file:item.file, logo: ""+entry.logo, group:group}, {upsert : true}, function (err, res) {
    			length--;
    			if(length<1){
    				var diff = moment(new Date()).diff(startDate, 'seconds');
    				console.log("-- setLuckyChannelsLive End --",diff);
    				callBack();
    			}
    		});
		} catch (e) {
			length--;
			console.log(title,"\t\t", entry,"\t\t", item.title);
		}
	  });

	} catch (e) {
		console.log("error setLuckyChannelsLive",e);
	}

}


function setLuckyChannelsOndemand(callBack) {
	var startDate = new Date();
	console.log("-- setLuckyChannelsOndemand Start --");
	try {

	var res = request("GET","http://lucky.lts2.net:24000/get.php?username=mindagaus&password=wbrutd7DAp&type=m3u_plus&output=ts");
	
	var body = res.getBody();
//	var b = iconv.decode(new Buffer(body), 'iso-8859-1');
	var b = iconv.encode(new Buffer(body), 'iso-8859-1');
//	var b = new Buffer(body, 'utf8');
//	console.log(b.toString());
	fs.writeFileSync("playlist-ondemand.m3u", b);
    var M3U = parsers.M3U;
    var file = iconv.decode(fs.readFileSync("playlist-ondemand.m3u"), 'iso-8859-1');
    var playlist = M3U.parse(file);
//    var playlist = M3U.parse(fs.readFileSync("playlist-ondemand.m3u", { encoding: "utf8" }));
    
    var group = "";
    var length = playlist.length;
    playlist.forEach(function(item) {
    	var title = item.title;
    	title = title
    				.replace("-1 ","")
    				.replace("tvg-name=\" ","tvg-name=\"")
    				.replace("tvg-id=\"\" ","\"")
    				.replace(/\" /g,"\", \"")
    				.replace(/tvg-/g,"")
    				.replace("group-","")
    				.replace(/=\"/g,"\":\"");//replace all
    	var entries = title.split(',');
    	var entry = ("{"+entries[0]+","+entries[1]+","+entries[2]+"}").replace(/=\":\"/g,"=\""); 
    	try {
    		entry = JSON.parse(entry); 
    		if (entry.name.indexOf("==") == 0){
    			group = entry.name.replace("===== ","").replace(" ====","").replace("====","").replace("===","").trim();
    			length--;
    			return;
    		}
    		if(entry.title){
    			entry.title = entry.title.replace(/=/g,"").trim();
    		}
    		database.ONDEMAND.findOneAndUpdate({name: entry.name}, {title: entry.title, file:item.file, logo: ""+entry.logo, group:group}, {upsert : true}, function (err, res) {
    			length--;
    			if(length<1){
    				var diff = moment(new Date()).diff(startDate, 'seconds');
    				console.log("-- setLuckyChannelsOndemand End --",diff);
    				callBack();
    			}
    		});
		} catch (e) {
			length--;
			console.log(title,"\t\t", entry,"\t\t", item.title,"\t\t\n",e);
		}
	  });
    
	} catch (e) {
		console.log("error setLuckyChannelsOndemand",e);
	}	
	
}


	module.exports.init = function () {
		
		database.ONDEMAND.findOne().exec(function (err, channels) {
			if(channels){
				console.log('sync later');
				new CronJob("00 01 05 * * *", function(){
					console.log('job sync at ', new Date());
					startSync();
				},null, true, null, {});
			}else{
				console.log('sync now');
				setTimeout(startSync, 1000);
			}
			
		});
		
	}
	

	
	function startSync(){

		var startDate = new Date();
		
		database.ONDEMAND.remove({}, function (err, data) {});
		database.LUCKY_LIVE.remove({}, function (err, data) {});
		setTimeout(function() {
			setLuckyChannelsLive(function() {
				setLuckyChannelsOndemand(function() {
					getOndemandTrailer(function() {
						getOndemandDescription(function() {
							var diff = moment(new Date()).diff(startDate, 'seconds');
							console.log("-- sync finished --", diff);
						});
					});
				});
			});
		}, 2000);		
	}
	