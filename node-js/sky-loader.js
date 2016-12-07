
//var jsonChannels = require('./grid_meglio_channels.json');
var request = require('sync-request');
var cheerio = require('cheerio');
var database = require('./database.js');
var http = require('http');

module.exports.getChanels = function (callback) {
	var res = request("GET",'http://guidatv.sky.it/app/guidatv/contenuti/data/grid/grid_meglio_channels.js');
	return JSON.parse(res.getBody());
}

module.exports.getChanelDetail = function (id, date, callback) {
	var year = date.getFullYear();
	var month = date.getMonth()+1;
	var date = date.getDate();
	month = (month<10) ? "0"+month : month;
	date = (date<10) ? "0"+date : date;
	date = (year+"").replace("20","") + "_"+month+"_"+ date;
	
	var res = request("GET",'http://guidatv.sky.it/app/guidatv/contenuti/data/grid/'+date+'/ch_'+id+'.js');
	return JSON.parse(res.getBody());

}

module.exports.getEventDescription = function (id, callback) {
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













	
	
	
	module.exports.getProgrammaDetail = function () {

		var c =0;
		database.PROGRAMS.find({description2:null}).exec(function (err, programs) {
				console.log(programs.length);
				
				  programs.forEach(function(program) {
					  c++;
					  var url = 'http://guidatv.sky.it/guidatv/programma/'+program.genre+'/'+program.subgenre+'/'+program.normalizedtitle+'_'+program.pid+'.shtml?eventid='+program.id;
					  url = url.replace(/ /g,"");
					  try {
							var res = request("GET",url);
							var body = res.getBody();
							if(body){
								
						        var parsedHTML = cheerio.load(body, {
						            normalizeWhitespace: true
						        });
						        
//						        var img_big_url = parsedHTML('meta[property="og:image"]').attr('content');
						        var img_big_url = parsedHTML('.foto img').attr('src');
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
					    			  console.log("OK:",err, res);
					    		  });	
//						        console.log("OK2: ", program.id,url);
								
							}
						} catch (e) {
							 console.log("error main:",program.id,url);
						}
						console.log(c);
				  });
				  console.log("-- getProgrammaDetail End --", new Date());
		});	

	}