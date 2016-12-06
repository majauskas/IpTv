
var jsonChannels = require('./grid_meglio_channels.json');
var request = require('sync-request');
//var http = require('http');

module.exports.scan = function (callback) {
//	var str = '{ "name": "John Doe", "age": 42 }';
//	var obj = JSON.parse(str);
//	console.log(obj);
//	
//	
//	request({'url':'http://guidatv.sky.it/app/guidatv/contenuti/data/grid/grid_meglio_channels.js'}, function (error, response, body) {
//	    if(error) console.log(error);
//	    else console.log(body)
//    });  
//	
//	module.exports.getChanels(function (data) {
//		console.log(data);
//	});
//	callback({});
}



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
//		console.log(id,url);
		var res = request("GET",url);
//		console.log(id,url,res);
		var body = res.getBody();
		
		var event = {};
		if(body)
			event = JSON.parse(body);
		if(!event.img_small){
			event.img_small = null; 
		}
//		console.log(id,"event",event);
		
		if(event.thumbnail_url && event.thumbnail_url !== "#"){
			var url2 = "http://guidatv.sky.it/app/guidatv/images"+event.thumbnail_url;
			
			var res2 = request("GET",url2);
			var body2 = res2.getBody();
			var img_small = {};
			if(body2){
				var imgBase64 = new Buffer(body2, 'binary').toString('base64');
				event.img_small = imgBase64;
				return event;
			}
		}else{
			return event;
		}
	} catch (e) {
		return;
	}
//	request({'url':'http://guidatv.sky.it/EpgBackend/event_description.do?eid='+id}, function (error, response, body) {
//	    if(error) console.log(error);
//	    else {
//	    	var event = {};
//	    	if(body)
//	    		event = JSON.parse(body);
//	    	
//	    	if(event.thumbnail_url && event.thumbnail_url !== "#"){
//	    		var url = "http://guidatv.sky.it/app/guidatv/images"+event.thumbnail_url;
//				http.request(url, function(res) {                                        
//					var img_small = {};
//					res.on('data', function(body) { 
//						if(body){
//							var imgBase64 = new Buffer(body, 'binary').toString('base64');
//							event.img_small = imgBase64;
//							callback(event);
//						}
//					});                                                                                                                                                  
//				}).end();
//	    	}else{
//	    		console.log(event.thumbnail_url);
//	    		callback(event);
//	    	}
//			
//	    }
//    });  
}
